import { useState } from 'react';
import {
    getBibleInfo, getBookKVList, getChapterCount,
} from './bibleInfoHelpers';
import BibleItem from '../../bible-list/BibleItem';

import bibleJson from './bible.json';
import { getOnlineBibleInfoList } from './bibleDownloadHelpers';
import { useAppEffect } from '../debuggerHelpers';
export const bibleObj = bibleJson as {
    booksOrder: string[],
    books: { [key: string]: BookType },
    kjvKeyValue: { [key: string]: string },
};

export type BibleStatusType = [string, boolean, string];

export type BookType = {
    key: string,
    chapterCount: number
};

export const toLocaleNum = (n: number, numList: string[]) => {
    if (!numList) {
        return n;
    }
    return `${n}`.split('').map((n1) => {
        return numList[+n1];
    }).join('');
};

export async function genMatches(bibleKey: string, inputText: string) {
    const kjvKeyValue = getKJVKeyValue();
    const bookKVList = await getBookKVList(bibleKey);
    if (bookKVList === null) {
        return null;
    }
    const check = (v1: string, v2: string) => {
        if (v1.toLowerCase().includes(v2.toLowerCase())) {
            return true;
        }
    };
    const keys = Object.keys(bookKVList);
    return keys.filter((k) => {
        const kjvV = kjvKeyValue[k];
        const v = bookKVList[k];
        if (check(kjvV, inputText) || check(inputText, kjvV) ||
            check(k, inputText) || check(inputText, k) ||
            check(v, inputText) || check(inputText, v)) {
            return true;
        }
        return false;
    });
};
export function useMatch(bibleKey: string, inputText: string) {
    const [matches, setMatches] = useState<string[] | null>(null);
    useAppEffect(() => {
        genMatches(bibleKey, inputText).then((ms) => {
            setMatches(ms);
        });
    }, [bibleKey, inputText]);
    return matches;
}
export function useGetBookKVList(bibleSelected: string) {
    const [bookKVList, setBookKVList] = useState<{
        [key: string]: string;
    } | null>(null);
    useAppEffect(() => {
        getBookKVList(bibleSelected).then((list) => {
            setBookKVList(list);
        });
    }, [bibleSelected]);
    return bookKVList;
}
export function useGetBibleWithStatus(bibleKey: string) {
    const [bibleStatus, setBibleStatus] = useState<BibleStatusType | null>(null);
    useAppEffect(() => {
        getBibleInfoWithStatus(bibleKey).then((bs) => setBibleStatus(bs));
    }, [bibleKey]);
    return bibleStatus;
}
export function useGetChapterCount(bibleSelected: string, bookSelected: string) {
    const [chapterCount, setChapterCount] = useState<number | null>(null);
    useAppEffect(() => {
        getChapterCount(bibleSelected, bookSelected).then((chapterCount) => {
            setChapterCount(chapterCount);
        });
    });
    return chapterCount;
}
export function genDuplicatedMessage(list: BibleItem[],
    { target }: BibleItem, i: number) {
    let warningMessage;
    const duplicated = list.find(({ target: target1 }, i1) => {
        return target.book === target1.book &&
            target.chapter === target1.chapter &&
            target.startVerse === target1.startVerse &&
            target.endVerse === target1.endVerse && i !== i1;
    });
    if (duplicated) {
        warningMessage = `Duplicated with item number ${list.indexOf(duplicated) + 1}`;
    }
    return warningMessage;
}

export function getKJVKeyValue() {
    return bibleObj.kjvKeyValue;
}

async function getBibleInfoWithStatus(bibleKey: string):
    Promise<BibleStatusType> {
    const bibleInfo = await getBibleInfo(bibleKey);
    const isAvailable = bibleInfo !== null;
    return [bibleKey, isAvailable, `${!isAvailable ? '🚫' : ''}${bibleKey}`];
}

export async function getBibleInfoWithStatusList() {
    const list: BibleStatusType[] = [];
    const bibleListOnline = await getOnlineBibleInfoList();
    if (bibleListOnline === null) {
        return list;
    }
    for (const bible of bibleListOnline) {
        list.push(await getBibleInfoWithStatus(bible.key));
    }
    return list;
}

async function toChapter(bibleKey: string, bookKey: string,
    chapterNum: number) {
    // KJV, GEN, 1
    const info = await getBibleInfo(bibleKey);
    if (info === null) {
        return null;
    }
    const book = info.books[bookKey];
    return `${book} ${info.numList === undefined ? chapterNum :
        toLocaleNum(chapterNum, info.numList)}`;
}

export function getKJVChapterCount(bookKey: string) {
    // KJV, GEN
    return bibleObj.books[bookKey].chapterCount;
}

export function toChapterList(bibleKey: string, bookKey: string) {
    // KJV, GEN
    const chapterCount = getKJVChapterCount(bookKey);
    return Array.from({ length: chapterCount }, (_, i) => {
        return toChapter(bibleKey, bookKey, i + 1);
    });
}

function toIndex(bookKey: string, chapterNum: number) {
    chapterNum = +chapterNum;
    let index = -1;
    let bIndex = 0;
    while (bibleObj.booksOrder[bIndex]) {
        const bookKey1 = bibleObj.booksOrder[bIndex];
        const chapterCount = bibleObj
            .books[bookKey1].chapterCount;
        if (bookKey1 === bookKey) {
            if (chapterNum > chapterCount) {
                return -1;
            }
            index += chapterNum;
            break;
        }
        index += chapterCount;
        bIndex++;
    }
    return index;
}

export function toFileName(bookKey: string, chapterNum: number) {
    const index = toIndex(bookKey, chapterNum);
    if (index < 0) {
        throw new Error('Invalid chapter number');
    }
    let indexStr = `000${index}`;
    indexStr = indexStr.substring(indexStr.length - 4);
    return `${indexStr}-${bookKey}.${chapterNum}`;
}

export async function toBookKey(bibleKey: string, book: string) {
    const info = await getBibleInfo(bibleKey);
    if (info !== null) {
        for (const k in info.books) {
            if (info.books[k] === book) {
                return k;
            }
        }
    }
    return null;
}
