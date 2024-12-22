import { useState } from 'react';

import {
    getBibleInfo, getBookKVList,
} from './bibleInfoHelpers';
import bibleJson from './bible.json';
import { getOnlineBibleInfoList } from './bibleDownloadHelpers';
import { useAppEffect, useAppEffectAsync } from '../debuggerHelpers';
import { toLocaleNumBB } from './serverBibleHelpers2';
import { genVerseList } from '../../bible-list/bibleHelpers';
import BibleItem from '../../bible-list/BibleItem';

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
        return numList[parseInt(n1)];
    }).join('');
};

export async function genChapterMatches(
    bibleKey: string, bookKey: string, guessingChapter: string | null,
) {
    const chapterCount = getKJVChapterCount(bookKey);
    const chapterList = Array.from({ length: chapterCount }, (_, i) => {
        return i + 1;
    });
    const chapterNumStrList = await Promise.all(chapterList.map((chapter) => {
        return toLocaleNumBB(bibleKey, chapter);
    }));
    const newList = chapterNumStrList.map((chapterNumStr, i) => {
        return [chapterList[i], chapterNumStr];
    });
    const newFilteredList = newList.filter((chapterMatch) => {
        return chapterMatch[0] !== null;
    }) as [number, string][];
    if (guessingChapter === null) {
        return newFilteredList;
    }
    const filteredList = newFilteredList.filter(([chapter, chapterNumStr]) => {
        const chapterStr = `${chapter}`;
        return (
            chapterStr.includes(guessingChapter) ||
            guessingChapter.includes(chapterStr) ||
            chapterNumStr.includes(guessingChapter) ||
            guessingChapter.includes(chapterNumStr)
        );
    });
    filteredList.sort(([chapter, chapterNumStr]) => {
        const chapterStr = `${chapter}`;
        if (
            chapterNumStr === guessingChapter ||
            chapterStr === guessingChapter
        ) {
            return -1;
        }
        return 1;
    });
    return filteredList;
}
export function useChapterMatch(
    bibleKey: string, bookKey: string, guessingChapter: string | null,
) {
    const [matches, setMatches] = useState<[number, string][] | null>(null);
    useAppEffectAsync(async (methodContext) => {
        const chapterNumStrList = await genChapterMatches(
            bibleKey, bookKey, guessingChapter,
        );
        methodContext.setMatches(chapterNumStrList);
    }, [bookKey, guessingChapter], { setMatches });
    return matches;
}

export async function genBookMatches(
    bibleKey: string, guessingBook: string,
): Promise<[string, string, string][] | null> {
    const bookKVList = await getBookKVList(bibleKey);
    if (bookKVList === null) {
        return null;
    }
    const check = (v1: string, v2: string) => {
        if (v1.toLowerCase().includes(v2.toLowerCase())) {
            return true;
        }
    };
    const keys = Object.entries(bookKVList);
    const kjvKeyValue = getKJVKeyValue();
    return keys.filter(([bookKey, book]) => {
        const kjvValue = kjvKeyValue[bookKey];
        if (check(kjvValue, guessingBook) || check(guessingBook, kjvValue) ||
            check(kjvValue, guessingBook) || check(guessingBook, kjvValue) ||
            check(book, guessingBook) || check(guessingBook, book)) {
            return true;
        }
        return false;
    }).map(([bookKey, book]) => {
        return [bookKey, book, kjvKeyValue[bookKey]];
    });
};
export function useBookMatch(bibleKey: string, guessingBook: string) {
    const [matches, setMatches] = useState<[string, string, string][] | null>(
        null,
    );
    useAppEffect(() => {
        genBookMatches(bibleKey, guessingBook).then((bookMatches) => {
            setMatches(bookMatches);
        });
    }, [bibleKey, guessingBook]);
    return matches;
}
export function useGenVerseList(bibleItem: BibleItem) {
    const [verseList, setVerseList] = useState<[number, string][] | null>(null);
    const { bibleKey, target } = bibleItem;
    const { bookKey, chapter } = target;
    useAppEffect(() => {
        genVerseList({ bibleKey, bookKey, chapter }).then((verseNumList) => {
            setVerseList(verseNumList);
        });
    }, [bibleKey, bookKey, chapter]);
    return verseList;
}
export function useGetBookKVList(bibleKey: string) {
    const [bookKVList, setBookKVList] = useState<{
        [key: string]: string;
    } | null>(null);
    useAppEffect(() => {
        getBookKVList(bibleKey).then((list) => {
            setBookKVList(list);
        });
    }, [bibleKey]);
    return bookKVList;
}
export function useGetBibleWithStatus(bibleKey: string) {
    const [bibleStatus, setBibleStatus] = useState<BibleStatusType | null>(
        null,
    );
    useAppEffect(() => {
        getBibleInfoWithStatus(bibleKey).then((bs) => setBibleStatus(bs));
    }, [bibleKey]);
    return bibleStatus;
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
