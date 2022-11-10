import appProvider from '../appProvider';
import {
    fsCreateDir,
    fsReadFile,
    pathJoin,
} from '../fileHelper';
import { LocaleType } from '../../lang';
import { getUserWritablePath } from '../appHelper';
import {
    is_dev,
    decrypt,
} from '../../_owa-crypto/owa_crypto';
import {
    getKJVChapterCount,
    toBookKey,
    toFileName,
} from './bibleHelpers';

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
    if (!bibleStorage.infoMapper.get(bibleKey)) {
        const info: BibleInfoType | null = await readBibleData(bibleKey, '_info');
        bibleStorage.infoMapper.set(bibleKey, info);
    }
    return bibleStorage.infoMapper.get(bibleKey) || null;
}

