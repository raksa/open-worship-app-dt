import appProvider from '../appProvider';
import {
    fsCheckFileExist,
    fsCreateDir,
    fsCreateWriteStream,
    fsDeleteFile,
    fsReadFile,
    pathJoin,
} from '../fileHelper';
import { LocaleType } from '../../lang';
import { getUserWritablePath } from '../appHelper';
import {
    get_api_url,
    get_api_key,
    is_dev,
    decrypt,
} from '../../_owa-crypto';
import {
    getKJVChapterCount,
    toBookKey,
    toFileName,
} from './bibleHelpers';

export function httpsRequest(pathName: string,
    callback: (error: Error | null, response?: any) => void) {
    const hostname = get_api_url().split('//')[1];
    const request = appProvider.httpUtils.request({
        port: 443,
        path: pathName,
        method: 'GET',
        hostname,
        headers: {
            'x-api-key': get_api_key(),
        },
    }, (response) => {
        callback(null, response);
    });
    request.on('error', (event: Error) => {
        callback(event);
    });
    request.end();
}

export type DownloadOptionsType = {
    onStart: (totalSize: number) => void,
    onProgress: (percentage: number) => void,
    onDone: (error?: Error) => void
}

const getDownloadHandler = (filePath: string, fileName: string,
    options: DownloadOptionsType) => {
    return async (error: any, response: any) => {
        if (await fsCheckFileExist(filePath)) {
            await fsDeleteFile(filePath);
        }
        const writeStream = fsCreateWriteStream(filePath);
        try {
            if (error || response.statusCode !== 200) {
                appProvider.appUtils.handleError(error);
                writeStream.close();
                await fsDeleteFile(filePath);
                options.onDone(new Error('Error during download'));
                return;
            }
            const len = parseInt(response.headers['content-length'], 10);
            let cur = 0;
            const mb = 1048576;//1048576 - bytes in  1Megabyte
            const total = len / mb;
            options.onStart(+(total.toFixed(2)));
            response.on('data', (chunk: Buffer) => {
                if (writeStream.writable) {
                    writeStream.write(chunk, (error1) => {
                        if (error1) {
                            appProvider.appUtils.handleError(error1);
                        }
                    });
                }
                cur += chunk.length;
                options.onProgress(cur / len);
            });
            response.on('end', async () => {
                writeStream.close();
                await getBibleInfo(fileName, true);
                options.onDone();
            });
        } catch (error2) {
            writeStream.close();
            try {
                await fsDeleteFile(filePath);
            } catch (error) {
                appProvider.appUtils.handleError(error);
            }
            options.onDone(error2 as Error);
        }
    };
};
export async function startDownloadBible({
    bibleFileFullName,
    fileName,
    options,
}: {
    bibleFileFullName: string,
    fileName: string,
    options: DownloadOptionsType
}) {
    const filePath = await toBiblePath(bibleFileFullName);
    if (filePath === null) {
        return options.onDone(new Error('Invalid file path'));
    }
    httpsRequest(bibleFileFullName,
        getDownloadHandler(filePath, fileName, options));
}

export type BibleInfoType = {
    title: string,
    key: string,
    locale: LocaleType,
    legalNote: string,
    publisher: string,
    copyRights: string,
    books: { [key: string]: string },
    numList?: string[],
    version: number,
};
export type BookList = { [key: string]: string };
export type VerseList = { [key: string]: string };
export type ChapterType = { title: string, verses: VerseList };
const bibleStorage: {
    infoMapper: Map<string, BibleInfoType | null>,
    bibles: string[],
    chapterCountMapper: Map<string, number>,
    chapterMapper: Map<string, ChapterType | null>,
} = {
    infoMapper: new Map(),
    bibles: [],
    chapterCountMapper: new Map(),
    chapterMapper: new Map(),
};
export function clearBibleCache() {
    bibleStorage.infoMapper.clear();
    bibleStorage.chapterCountMapper.clear();
    bibleStorage.chapterMapper.clear();
}

export async function getBookKVList(bibleKey: string) {
    const info = await getBibleInfo(bibleKey);
    if (info === null) {
        return null;
    }
    return info.books;
}
export async function keyToBook(bibleKey: string, bookKey: string) {
    const bookKVList = await getBookKVList(bibleKey);
    if (bookKVList === null) {
        return null;
    }
    return bookKVList[bookKey] || null;
}
export async function getBookVKList(bibleKey: string) {
    const bibleVKList = await getBookKVList(bibleKey);
    if (bibleVKList === null) {
        return null;
    }
    return Object.fromEntries(Object.entries(bibleVKList).map(([k, v]) => {
        return [v, k];
    }));
}
export async function bookToKey(bibleKey: string, book: string) {
    const bookVKList = await getBookVKList(bibleKey);
    if (bookVKList === null) {
        return null;
    }
    return bookVKList[book] || null;
}
export async function getChapterCount(bibleKey: string, book: string) {
    if (!bibleStorage.chapterCountMapper.has(book)) {
        const bookKey = await toBookKey(bibleKey, book);
        if (bookKey === null) {
            return null;
        }
        const chapterCount = getKJVChapterCount(bookKey);
        bibleStorage.chapterCountMapper.set(book, chapterCount);
    }
    return bibleStorage.chapterCountMapper.get(book) || null;
}
export async function getBookChapterData(bibleKey: string,
    bookKey: string, chapterNumber: number) {
    const fileName = toFileName(bookKey, chapterNumber);
    const vInfo = await readBibleData(bibleKey, fileName) as ChapterType | null;
    if (vInfo === null) {
        return null;
    }
    return vInfo;
}
export async function getVerses(bibleKey: string, bookKey: string, chapter: number) {
    const key = `${bibleKey} => ${bookKey} ${chapter}`;
    if (!bibleStorage.chapterMapper.has(key)) {
        const chapterData = await getBookChapterData(bibleKey, bookKey, chapter);;
        bibleStorage.chapterMapper.set(key, chapterData);
    }
    const chapterObj = bibleStorage.chapterMapper.get(key);
    if (!chapterObj) {
        return null;
    }
    return chapterObj.verses;
}

export async function getWritableBiblePath() {
    const dirPath = pathJoin(getUserWritablePath(), `bibles${is_dev() ? '-dev' : ''}`);
    try {
        await fsCreateDir(dirPath);
    } catch (error: any) {
        if (!error.message.includes('file already exists')) {
            appProvider.appUtils.handleError(error);
            return null;
        }
    }
    return pathJoin(getUserWritablePath(), 'bibles');
}

export async function toBiblePath(bibleKey: string) {
    const writableBiblePath = await getWritableBiblePath();
    if (writableBiblePath === null) {
        return null;
    }
    return pathJoin(writableBiblePath, bibleKey);
}

export async function readBibleData(bibleKey: string, key: string) {
    try {
        const biblePath = await toBiblePath(bibleKey);
        if (biblePath === null) {
            return null;
        }
        const filePath = pathJoin(biblePath, key);
        const data = await fsReadFile(filePath);
        const rawData = appProvider.appUtils.base64Decode(decrypt(data));
        return JSON.parse(rawData);
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            appProvider.appUtils.handleError(error);
        }
    }
    return null;
}

export async function getBibleInfo(bibleKey: string, isForce: boolean = false) {
    if (isForce) {
        bibleStorage.infoMapper.delete(bibleKey);
    }
    if (!bibleStorage.infoMapper.has(bibleKey)) {
        const info: BibleInfoType | null = await readBibleData(bibleKey, '_info');
        bibleStorage.infoMapper.set(bibleKey, info);
    }
    return bibleStorage.infoMapper.get(bibleKey) || null;
}

