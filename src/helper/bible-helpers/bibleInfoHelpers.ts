import appProvider from '../../server/appProvider';
import {
    fsCreateDir,
    fsReadFile,
    pathJoin,
} from '../../server/fileHelper';
import { LocaleType } from '../../lang';
import { getUserWritablePath } from '../../server/appHelper';
import {
    is_dev,
    decrypt,
} from '../../_owa-crypto/owa_crypto';
import {
    getKJVChapterCount,
    toBookKey,
    toFileName,
} from './serverBibleHelpers';
import { handleError } from '../errorHelpers';

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
    return bookKVList[bookKey] ?? null;
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
    return bookVKList[book] ?? null;
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
    return bibleStorage.chapterCountMapper.get(book) ?? null;
}
export async function getBookChapterData(bibleKey: string,
    bookKey: string, chapterNumber: number) {
    const fileName = toFileName(bookKey, chapterNumber);
    const vInfo = await bibleDataReader
        .readBibleData(bibleKey, fileName) as ChapterType | null;
    if (vInfo === null) {
        return null;
    }
    return vInfo;
}
export async function getVerses(
    bibleKey: string, bookKey: string, chapter: number,
) {
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

type ReadingBibleDataType = BibleInfoType | null;
type CallbackType = (data: ReadingBibleDataType) => void;
export class BibleDataReader {
    _writableBiblePath: string | null = null;
    _callbackMapper: Map<string, Array<CallbackType>> = new Map();
    _pushCallback(key: string, callback: CallbackType) {
        const callbackList = this._callbackMapper.get(key) ?? [];
        callbackList.push(callback);
        this._callbackMapper.set(key, callbackList);
        return callbackList.length === 1;
    }
    _fullfilCallback(key: string, data: ReadingBibleDataType) {
        const callbackList = this._callbackMapper.get(key) ?? [];
        this._callbackMapper.delete(key);
        callbackList.forEach((callback) => {
            callback(data);
        });
    }
    async _readBibleData(bibleKey: string, key: string,
        callback: CallbackType) {
        const biblePath = await this.toBiblePath(bibleKey);
        if (biblePath === null) {
            return callback(null);
        }
        const filePath = pathJoin(biblePath, key);
        const isFist = this._pushCallback(filePath, callback);
        if (!isFist) {
            return;
        }
        let data: ReadingBibleDataType = null;
        try {
            const fileData = await fsReadFile(filePath);
            const rawData = appProvider.appUtils.base64Decode(decrypt(fileData));
            data = JSON.parse(rawData);
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                handleError(error);
            }
        }
        this._fullfilCallback(filePath, data);
    }
    readBibleData(bibleKey: string, key: string) {
        return new Promise<ReadingBibleDataType>((resolve) => {
            this._readBibleData(bibleKey, key, resolve);
        });
    }
    async toBiblePath(bibleKey: string) {
        const writableBiblePath = await this.getWritableBiblePath();
        if (writableBiblePath === null) {
            return null;
        }
        return pathJoin(writableBiblePath, bibleKey);
    }
    async getWritableBiblePath() {
        if (this._writableBiblePath === null) {
            const userWritablePath = getUserWritablePath();
            const dirPath = pathJoin(userWritablePath,
                `bibles${is_dev() ? '-dev' : ''}`);
            try {
                await fsCreateDir(dirPath);
            } catch (error: any) {
                if (!error.message.includes('file already exists')) {
                    handleError(error);
                }
            }
            this._writableBiblePath = pathJoin(userWritablePath, 'bibles');
        }
        return this._writableBiblePath;
    }
}
export const bibleDataReader = new BibleDataReader();


export async function getBibleInfo(bibleKey: string, isForce: boolean = false) {
    if (isForce) {
        bibleStorage.infoMapper.delete(bibleKey);
    }
    if (!bibleStorage.infoMapper.get(bibleKey)) {
        const info = await bibleDataReader.readBibleData(
            bibleKey, '_info');
        bibleStorage.infoMapper.set(bibleKey, info);
    }
    return bibleStorage.infoMapper.get(bibleKey) ?? null;
}
