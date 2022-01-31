import { useState, useEffect } from "react";
import fullTextPresentHelper, {
    BiblePresentType
} from "../full-text-present/fullTextPresentHelper";
import { toLocaleNumber } from "../bible-search/bibleSearchHelpers";
import { sqlite3ReadValue } from "../helper/electronHelper";
import electronProvider from "../helper/electronProvider";
import bibleHelper from "./bibleHelper";

export const sqlite3Read = (bible: string, key: string, cipherKey: string) => {
    const dbFilePath = bibleHelper.toDbPath(bible);
    if (dbFilePath === null) {
        return Promise.resolve(null);
    }
    return new Promise<object | null>(async (resolve, reject) => {
        let callback = (data: any) => {
            callback = () => { };
            resolve(data);
        };
        const encryptKey = electronProvider.cipher.encrypt(key, cipherKey);
        const value = await sqlite3ReadValue(dbFilePath, 'bibles', encryptKey);
        if (value !== null) {
            try {
                const decrypted = electronProvider.cipher.decrypt(value, cipherKey);
                const json = JSON.parse(decrypted);
                callback(json);
                return;
            } catch (error) {
                console.log(error);
            }
        }
        callback(null);
    });
};

export const httpsRequest = (pathName: string, callback: (error: Error | null, response?: any) => void) => {
    const request = electronProvider.https.request({
        port: 443,
        path: pathName,
        method: 'GET',
    }, (response) => {
        callback(null, response);
    });
    request.on("error", (e: Error) => {
        callback(e);
    });
    request.end();
};
export const fetch = (pathName: string) => {
    return new Promise<any>((resolve, reject) => {
        httpsRequest(pathName, (error, response) => {
            if (error) {
                return reject(error);
            } else if (response.statusCode !== 200) {
                return reject(new Error(`Fail to request with status ${response.statusCode}`))
            }
            const chunks: Buffer[] = [];
            response.on("data", (chunk: Buffer) => {
                chunks.push(Buffer.from(chunk));
            });
            response.on("end", () => {
                try {
                    const body = Buffer.concat(chunks).toString();
                    try {
                        const json = JSON.parse(body);
                        resolve(json);
                    } catch (error) {
                        resolve(body);
                    }
                } catch (error) {
                    console.log(error);
                    reject(new Error('Fail to fetch body'));
                }
            });
        });
    });
};
export type DownloadOptionsType = {
    onStart: (totalSize: number) => void, onProgress: (percentage: number) => void,
    onDone: (error?: Error) => void
};
export const startDownloading = (url: string, downloadPath: string, fileName: string,
    { onStart, onProgress, onDone }: DownloadOptionsType) => {
    const filePath = electronProvider.path.join(downloadPath, fileName);
    const removeFile = () => {
        try {
            electronProvider.fs.unlinkSync(filePath);
        } catch (error) { }
    }
    removeFile();
    httpsRequest(url, (error, response: any) => {
        const writeStream = electronProvider.fs.createWriteStream(filePath);
        try {
            if (error || response.statusCode !== 200) {
                console.log(error);
                console.log(response);
                writeStream.close();
                removeFile();
                bibleHelper.setBibleCipherKey(fileName, '');
                onDone(new Error('Error during download'));
                return;
            }
            const len = parseInt(response.headers['content-length'], 10);
            let cur = 0;
            const mb = 1048576;//1048576 - bytes in  1Megabyte
            const total = len / mb;
            onStart(+(total.toFixed(2)));
            response.on("data", (chunk: Buffer) => {
                if (writeStream.writable) {
                    writeStream.write(chunk, (error) => {
                        if (error) {
                            console.log(error);
                        }
                    });
                }
                cur += chunk.length;
                onProgress(cur / len);
            });
            response.on("end", () => {
                writeStream.close();
                initInfo(fileName);
                onDone();
            });
        } catch (error) {
            writeStream.close();
            removeFile();
            onDone(error as Error);
        }
    });
};

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

export const getBookKVList = (bible: string) => {
    const info = getInfo(bible);
    if (info === null) {
        return null;
    }
    return info.books;
};
export const keyToBook = (bible: string, bookKey: string) => {
    const bookKVList = getBookKVList(bible);
    if (bookKVList === null) {
        return null;
    }
    return bookKVList[bookKey] || null;
};
export const getBookVKList = (bible: string) => {
    const bibleVKList = getBookKVList(bible);
    if (bibleVKList === null) {
        return null;
    }
    const bookVKList = Object.fromEntries(Object.entries(bibleVKList).map(([k, v]) => {
        return [v, k];
    }));
    return bookVKList;
};
export const bookToKey = (bible: string, book: string) => {
    const bookVKList = getBookVKList(bible);
    if (bookVKList === null) {
        return null;
    }
    return bookVKList[book] || null;
};
export const getChapterCount = (bible: string, book: string) => {
    if (!bibleStorage.chapterCountMapper[book]) {
        const bookKey = bibleHelper.toBookKey(bible, book);
        if (bookKey === null) {
            return null;
        }
        const chapterCount = bibleHelper.getKJVChapterCount(bookKey);
        bibleStorage.chapterCountMapper[book] = chapterCount;
    }
    return bibleStorage.chapterCountMapper[book];
}
export const getBookChapterData = async (bible: string, bookKey: string, chapterNumber: number) => {
    const fileName = bibleHelper.toFileName(bookKey, chapterNumber);
    const cipherKey = bibleHelper.getBibleCipherKey(bible);
    if (cipherKey === null) {
        return null;
    }
    const vInfo = await sqlite3Read(bible, fileName, cipherKey) as ChapterType | null;
    if (vInfo === null) {
        return null;
    }
    return vInfo;
};
export const getVerses = async (bible: string, bookKey: string, chapter: number) => {
    const k = `${bible} => ${bookKey} ${chapter}`;
    if (!bibleStorage.chapterMapper[k]) {
        bibleStorage.chapterMapper[k] = await getBookChapterData(bible, bookKey, chapter);;
    }
    const chapterObj = bibleStorage.chapterMapper[k];
    if (chapterObj === null) {
        return null;
    }
    return chapterObj.verses;
};
export const getBibleLocale = (bible: string) => {
    if (!bibleStorage.localeMapper[bible]) {
        const info = getInfo(bible);
        if (info === null) {
            return null;
        }
        const locale = info.locale;
        bibleStorage.localeMapper[bible] = locale;
    }
    return bibleStorage.localeMapper[bible];
};
export const biblePresentToTitle = ({ bible, target }: BiblePresentType) => {
    const { book, chapter, startVerse, endVerse } = target;
    const chapterLocale = toLocaleNumber(bible, chapter);
    const startVerseLocale = toLocaleNumber(bible, startVerse);
    const endVerseLocale = toLocaleNumber(bible, endVerse);
    const txtV = `${startVerseLocale}${startVerse !== endVerse ? ('-' + endVerseLocale) : ''}`;
    let bookKey = keyToBook(bible, book);
    if (bookKey === null) {
        bookKey = bibleHelper.getKJVKeyValue()[book];
    }
    const txt = `${bookKey} ${chapterLocale}:${txtV}`;
    return txt;
};
export const biblePresentToText = async ({ bible, target }: BiblePresentType) => {
    let txt = '😟Unable to get bible text, check downloaded bible list in setting or refresh application!👌';
    if (target.chapter === null) {
        return txt;
    }
    const verses = await getVerses(bible, target.book, target.chapter);
    if (verses === null) {
        return txt;
    }
    txt = '';
    for (let i = target.startVerse; i <= target.endVerse; i++) {
        txt += ` (${toLocaleNumber(bible, i)}): ${verses[`${i}`]}`;
    }
    return txt;
};

export function usePresentRenderText({ bible, target }: BiblePresentType) {
    const [text, setText] = useState<string>('');
    const { book, chapter, startVerse, endVerse } = target;
    useEffect(() => {
        biblePresentToText({ bible, target: { book, chapter, startVerse, endVerse } }).then(setText);
    }, [bible, book, chapter, startVerse, endVerse]);
    return text;
}

export const initInfo = async (bible: string) => {
    const cipherKey = bibleHelper.getBibleCipherKey(bible);
    if (cipherKey !== null) {
        const info = await sqlite3Read(bible, '_info.js', cipherKey);
        bibleStorage.infoMapper[bible] = info as BibleInfoType | null;
    }
};
export const getInfo = (bible: string) => {
    if (!bibleStorage.infoMapper[bible]) {
        const cipherKey = bibleHelper.getBibleCipherKey(bible);
        if (cipherKey !== null) {
            sqlite3Read(bible, '_info.js', cipherKey).then((info) => {
                bibleStorage.infoMapper[bible] = info as BibleInfoType | null;
            });
        }
    }
    return bibleStorage.infoMapper[bible] || null;
};
export const getBibleNumList = (bible: string) => {
    const info = getInfo(bible);
    if (info === null) {
        return null;
    }
    return info.numList || null;
};
export const initApp = () => {
    return new Promise<void>(async (resolve) => {

        // Showing
        fullTextPresentHelper.loadSetting();

        // Bibles
        if (!bibleHelper.getBibleList().length) {
            await bibleHelper.getBibleListOnline();
        }
        const list = bibleHelper.getDownloadedBibleList();
        for (const dbName of list) {
            await initInfo(dbName);
        }
        resolve();
    });
};