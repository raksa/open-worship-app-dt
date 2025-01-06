import { getKJVChapterCount, toBibleFileName } from './serverBibleHelpers';
import {
    bibleKeyToFilePath,
} from '../../setting/bible-setting/bibleXMLJsonDataHelpers';
import { bibleDataReader, BibleInfoType, ChapterType } from './BibleDataReader';
import { fsCheckFileExist } from '../../server/fileHelpers';
import { showSimpleToast } from '../../toast/toastHelpers';
import {
    cacheBibleXMLData, getBibleXMLDataFromKey,
} from '../../setting/bible-setting/bibleXMLHelpers';

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
    const bookKey = await bookToKey(bibleKey, book);
    if (bookKey === null) {
        return null;
    }
    const chapterCount = getKJVChapterCount(bookKey);
    return chapterCount;
}
export async function getBookChapterData(
    bibleKey: string, bookKey: string, chapter: number,
) {
    const chapterCount = getKJVChapterCount(bookKey);
    if (chapterCount === null || chapter > chapterCount) {
        return null;
    }
    const fileName = toBibleFileName(bookKey, chapter);
    const verseInfo = (
        await bibleDataReader.readBibleData(bibleKey, fileName) as
        ChapterType | null
    );
    if (verseInfo === null) {
        return null;
    }
    return verseInfo;
}
export async function getVerses(
    bibleKey: string, bookKey: string, chapter: number,
) {
    const chapterData = await getBookChapterData(bibleKey, bookKey, chapter);;
    return chapterData ? chapterData.verses : null;
}

const bibleInfoMap = (
    new Map<string, { info: BibleInfoType, timestamp: number }>()
);
export async function getBibleInfo(bibleKey: string, isForce = false) {
    if (isForce) {
        bibleInfoMap.delete(bibleKey);
    }
    if (bibleInfoMap.has(bibleKey)) {
        const item = bibleInfoMap.get(bibleKey);
        const duration = 1000 * 10; // 10 seconds
        if (item && Date.now() - item.timestamp < duration) {
            return item.info;
        }
    }
    const info = await bibleDataReader.readBibleData(bibleKey, '_info');
    if (info === null) {
        const xmlFilePath = await bibleKeyToFilePath(bibleKey);
        if (await fsCheckFileExist(xmlFilePath)) {
            showSimpleToast('Reload Bible XML Cache', 'This will take a while');
            const jsonData = await getBibleXMLDataFromKey(bibleKey);
            if (jsonData === null) {
                showSimpleToast('Loading', 'Failed to load Bible XML');
                return null;
            }
            const isSuccess = await cacheBibleXMLData(jsonData);
            if (isSuccess) {
                showSimpleToast('Loading', 'Bible XML reloaded');
            } else {
                return null;
            }
            return await getBibleInfo(bibleKey, true);
        }
    } else {
        bibleInfoMap.set(bibleKey, { info, timestamp: Date.now() });
    }
    return info;
}
