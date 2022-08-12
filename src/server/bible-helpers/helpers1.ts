import { sqlite3ReadValue } from '../appHelper';
import appProvider from '../appProvider';
import bibleHelper from './bibleHelpers';
import {
    fsCreateWriteStream,
    fsDeleteFile,
    pathJoin,
} from '../fileHelper';

export async function sqlite3Read(bibleName: string, key: string, cipherKey: string) {
    const dbFilePath = await bibleHelper.toDbPath(bibleName);
    if (dbFilePath === null) {
        return Promise.resolve(null);
    }
    return new Promise<any | null>(async (resolve) => {
        let callback = (data: any) => {
            callback = () => false;
            resolve(data);
        };
        const encryptKey = appProvider.cryptoUtils.encrypt(key, cipherKey);
        const value = await sqlite3ReadValue(dbFilePath, 'bibles', encryptKey);
        if (value !== null) {
            try {
                const decrypted = appProvider.cryptoUtils.decrypt(value, cipherKey);
                const json = JSON.parse(decrypted);
                callback(json);
                return;
            } catch (error) {
                console.log(error);
            }
        }
        callback(null);
    });
}

export function httpsRequest(pathName: string,
    callback: (error: Error | null, response?: any) => void) {
    const request = appProvider.httpUtils.request({
        port: 443,
        path: pathName,
        method: 'GET',
    }, (response) => {
        callback(null, response);
    });
    request.on('error', (event: Error) => {
        callback(event);
    });
    request.end();
}
export function fetch(pathName: string) {
    return new Promise<any>((resolve, reject) => {
        httpsRequest(pathName, (error, response) => {
            if (error) {
                return reject(error);
            } else if (response.statusCode !== 200) {
                const errorMessage = `Fail to request with status ${response.statusCode}`;
                return reject(new Error(errorMessage));
            }
            const chunks: Buffer[] = [];
            response.on('data', (chunk: Buffer) => {
                chunks.push(Buffer.from(chunk));
            });
            response.on('end', () => {
                try {
                    const body = Buffer.concat(chunks).toString();
                    try {
                        const json = JSON.parse(body);
                        resolve(json);
                    } catch (error1) {
                        resolve(body);
                    }
                } catch (error2) {
                    console.log(error2);
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
                console.log(error);
                console.log(response);
                writeStream.close();
                await fsDeleteFile(filePath);
                bibleHelper.setBibleCipherKey(fileName, '');
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
                            console.log(error1);
                        }
                    });
                }
                cur += chunk.length;
                onProgress(cur / len);
            });
            response.on('end', async () => {
                writeStream.close();
                await initBibleInfo(fileName);
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
    locale: string,
    legalNote: string,
    publisher: string,
    copyRights: string,
    books: { [key: string]: string },
    numList?: string[],
};
export type BookList = { [key: string]: string };
export type VerseList = { [key: string]: string };
export type ChapterType = { title: string, verses: VerseList };
export const bibleStorage: {
    infoMapper: { [key: string]: BibleInfoType | null },
    bibles: string[],
    localeMapper: { [key: string]: string }
    chapterCountMapper: { [key: string]: number }
    chapterMapper: { [key: string]: ChapterType | null },
} = {
    infoMapper: {},
    bibles: [],
    localeMapper: {},
    chapterCountMapper: {},
    chapterMapper: {},
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
    if (!bibleStorage.chapterCountMapper[book]) {
        const bookKey = await bibleHelper.toBookKey(bibleName, book);
        if (bookKey === null) {
            return null;
        }
        const chapterCount = bibleHelper.getKJVChapterCount(bookKey);
        bibleStorage.chapterCountMapper[book] = chapterCount;
    }
    return bibleStorage.chapterCountMapper[book];
}
export async function getBookChapterData(bibleName: string,
    bookKey: string, chapterNumber: number) {
    const fileName = bibleHelper.toFileName(bookKey, chapterNumber);
    const cipherKey = bibleHelper.getBibleCipherKey(bibleName);
    if (cipherKey === null) {
        return null;
    }
    const vInfo = await sqlite3Read(bibleName, fileName, cipherKey) as ChapterType | null;
    if (vInfo === null) {
        return null;
    }
    return vInfo;
}
export async function getVerses(bibleName: string, bookKey: string, chapter: number) {
    const k = `${bibleName} => ${bookKey} ${chapter}`;
    if (!bibleStorage.chapterMapper[k]) {
        bibleStorage.chapterMapper[k] = await getBookChapterData(bibleName, bookKey, chapter);;
    }
    const chapterObj = bibleStorage.chapterMapper[k];
    if (chapterObj === null) {
        return null;
    }
    return chapterObj.verses;
}

export async function initBibleInfo(bibleName: string) {
    const cipherKey = bibleHelper.getBibleCipherKey(bibleName);
    if (cipherKey !== null) {
        const info = await sqlite3Read(bibleName, '_info.js', cipherKey) as BibleInfoType | null;
        bibleStorage.infoMapper[bibleName] = info;
        return info;
    }
    return null;
}
export async function getBibleInfo(bibleName: string) {
    if (!bibleStorage.infoMapper[bibleName]) {
        const cipherKey = bibleHelper.getBibleCipherKey(bibleName);
        if (cipherKey !== null) {
            const info: BibleInfoType | null = await sqlite3Read(bibleName, '_info.js', cipherKey);
            bibleStorage.infoMapper[bibleName] = info;
        }
    }
    return bibleStorage.infoMapper[bibleName] || null;
}

