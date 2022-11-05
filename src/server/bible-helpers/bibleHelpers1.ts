import appProvider from '../appProvider';
import bibleHelper from './bibleHelpers';
import {
    fsCreateDir,
    fsCreateWriteStream,
    fsDeleteFile,
    fsReadFile,
    pathJoin,
} from '../fileHelper';
import { isValidJson } from '../../helper/helpers';
import { LocaleType } from '../../lang';
import { getUserWritablePath } from '../appHelper';
import { get_api_url, get_api_key } from '../../_owa-crypto';

export function httpsRequest(pathName: string,
    callback: (error: Error | null, response?: any) => void) {
    const request = appProvider.httpUtils.request({
        port: 443,
        path: pathName,
        method: 'GET',
        hostname: get_api_url(),
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
export function appFetch(pathName: string) {
    return new Promise<any>((resolve, reject) => {
        httpsRequest(pathName, (error, response) => {
            if (error) {
                return reject(error);
            } else if (response.statusCode !== 200) {
                const message = `Fail to request with status ${response.statusCode}`;
                return reject(new Error(message));
            }
            const chunks: Buffer[] = [];
            response.on('data', (chunk: Buffer) => {
                chunks.push(Buffer.from(chunk));
            });
            response.on('end', () => {
                try {
                    const str = Buffer.concat(chunks).toString();
                    if (isValidJson(str)) {
                        const json = JSON.parse(str);
                        resolve(json);
                    } else {
                        resolve(str);
                    }
                } catch (error) {
                    appProvider.appUtils.handleError(error);
                    reject(new Error('Fail to fetch body'));
                }
            });
        });
    });
}

export type DownloadOptionsType = {
    onStart: (totalSize: number) => void, onProgress: (percentage: number) => void,
    onDone: (error?: Error) => void
}

export async function startDownloading(url: string, downloadPath: string, fileName: string,
    { onStart, onProgress, onDone }: DownloadOptionsType) {
    const filePath = pathJoin(downloadPath, fileName);
    await fsDeleteFile(filePath);
    httpsRequest(url, async (error, response: any) => {
        const writeStream = fsCreateWriteStream(filePath);
        try {
            if (error || response.statusCode !== 200) {
                appProvider.appUtils.handleError(error);
                writeStream.close();
                await fsDeleteFile(filePath);
                onDone(new Error('Error during download'));
                return;
            }
            const len = parseInt(response.headers['content-length'], 10);
            let cur = 0;
            const mb = 1048576;//1048576 - bytes in  1Megabyte
            const total = len / mb;
            onStart(+(total.toFixed(2)));
            response.on('data', (chunk: Buffer) => {
                if (writeStream.writable) {
                    writeStream.write(chunk, (error1) => {
                        if (error1) {
                            appProvider.appUtils.handleError(error1);
                        }
                    });
                }
                cur += chunk.length;
                onProgress(cur / len);
            });
            response.on('end', async () => {
                writeStream.close();
                await getBibleInfo(fileName, true);
                onDone();
            });
        } catch (error2) {
            writeStream.close();
            await fsDeleteFile(filePath);
            onDone(error2 as Error);
        }
    });
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
export const bibleStorage: {
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

export async function getBookKVList(bibleName: string) {
    const info = await getBibleInfo(bibleName);
    if (info === null) {
        return null;
    }
    return info.books;
}
export async function keyToBook(bibleName: string, bookKey: string) {
    const bookKVList = await getBookKVList(bibleName);
    if (bookKVList === null) {
        return null;
    }
    return bookKVList[bookKey] || null;
}
export async function getBookVKList(bibleName: string) {
    const bibleVKList = await getBookKVList(bibleName);
    if (bibleVKList === null) {
        return null;
    }
    return Object.fromEntries(Object.entries(bibleVKList).map(([k, v]) => {
        return [v, k];
    }));
}
export async function bookToKey(bibleName: string, book: string) {
    const bookVKList = await getBookVKList(bibleName);
    if (bookVKList === null) {
        return null;
    }
    return bookVKList[book] || null;
}
export async function getChapterCount(bibleName: string, book: string) {
    if (!bibleStorage.chapterCountMapper.has(book)) {
        const bookKey = await bibleHelper.toBookKey(bibleName, book);
        if (bookKey === null) {
            return null;
        }
        const chapterCount = bibleHelper.getKJVChapterCount(bookKey);
        bibleStorage.chapterCountMapper.set(book, chapterCount);
    }
    return bibleStorage.chapterCountMapper.get(book) || null;
}
export async function getBookChapterData(bibleName: string,
    bookKey: string, chapterNumber: number) {
    const fileName = bibleHelper.toFileName(bookKey, chapterNumber);
    const vInfo = await readBibleData(bibleName, fileName) as ChapterType | null;
    if (vInfo === null) {
        return null;
    }
    return vInfo;
}
export async function getVerses(bibleName: string, bookKey: string, chapter: number) {
    const key = `${bibleName} => ${bookKey} ${chapter}`;
    if (!bibleStorage.chapterMapper.has(key)) {
        const chapterData = await getBookChapterData(bibleName, bookKey, chapter);;
        bibleStorage.chapterMapper.set(key, chapterData);
    }
    const chapterObj = bibleStorage.chapterMapper.get(key);
    if (!chapterObj) {
        return null;
    }
    return chapterObj.verses;
}

export async function getWritableBiblePath() {
    const dirPath = pathJoin(getUserWritablePath(), 'bibles');
    try {
        await fsCreateDir(dirPath);
    } catch (error: any) {
        appProvider.appUtils.handleError(error);
        return null;
    }
    return pathJoin(getUserWritablePath(), 'bibles');
}

export async function toBiblePath(bibleName: string) {
    const writableBiblePath = await getWritableBiblePath();
    if (writableBiblePath === null) {
        return null;
    }
    return pathJoin(writableBiblePath, bibleName);
}

export async function readBibleData(bibleName: string, key: string) {
    try {
        const biblePath = await toBiblePath(bibleName);
        if (biblePath === null) {
            return null;
        }
        const filePath = pathJoin(biblePath, key);
        const data = await fsReadFile(filePath);
        return JSON.parse(data);
    } catch (error) {
        appProvider.appUtils.handleError(error);
    }
    return null;
}

export async function getBibleInfo(bibleName: string, isForce: boolean = false) {
    if (isForce) {
        bibleStorage.infoMapper.delete(bibleName);
    }
    if (!bibleStorage.infoMapper.has(bibleName)) {
        const info: BibleInfoType | null = await readBibleData(bibleName, '_info');
        bibleStorage.infoMapper.set(bibleName, info);
    }
    return bibleStorage.infoMapper.get(bibleName) || null;
}

