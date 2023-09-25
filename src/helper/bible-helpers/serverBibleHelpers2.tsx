import { useState } from 'react';
import {
    bookToKey, getBibleInfo, getBookVKList, getChapterCount, getVerses,
} from './bibleInfoHelpers';
import { cloneJson } from '../helpers';
import {
    fromLocaleNum,
    LocaleType,
    toLocaleNum,
} from '../../lang';
import { useAppEffect } from '../debuggerHelpers';

export async function toInputText(bibleKey: string,
    book?: string | null, chapter?: number | null,
    startVerse?: number | null, endVerse?: number | null) {
    let txt = '';
    if (book) {
        txt += `${book} `;
        if (chapter !== undefined && chapter !== null) {
            txt += `${await toLocaleNumBB(bibleKey, chapter)}`;
            if (startVerse !== undefined && startVerse !== null) {
                txt += `:${await toLocaleNumBB(bibleKey, startVerse)}`;
                if (endVerse !== undefined && endVerse !== null &&
                    endVerse !== startVerse) {
                    txt += `-${await toLocaleNumBB(bibleKey, endVerse)}`;
                }
            }
        }
    }
    return txt;
}
export async function getBibleLocale(bibleKey: string) {
    const info = await getBibleInfo(bibleKey);
    if (info === null) {
        return 'en' as LocaleType;
    }
    return info.locale;
}
export async function toLocaleNumBB(bibleKey: string, n: number | null) {
    if (typeof n !== 'number') {
        return null;
    }
    const locale = await getBibleLocale(bibleKey);
    return toLocaleNum(locale, n);
}
export function useToLocaleNumBB(bibleKey: string, nString: number | null) {
    const [str, setStr] = useState<string | null>(null);
    useAppEffect(() => {
        toLocaleNumBB(bibleKey, nString).then(setStr);
    }, [bibleKey, nString]);
    return str;
}

export async function fromLocaleNumBB(bibleKey: string, localeNum: string) {
    const info = await getBibleInfo(bibleKey);
    if (info === null) {
        return null;
    }
    return fromLocaleNum(info.locale, localeNum);
}
export function useFromLocaleNumBB(bibleKey: string, localeNum: string) {
    const [n, setN] = useState<number | null>(null);
    useAppEffect(() => {
        fromLocaleNumBB(bibleKey, localeNum).then(setN);
    }, [bibleKey, localeNum]);
    return n;
}


export type ExtractedBibleResult = {
    book: string | null,
    chapter: number | null,
    startVerse: number | null,
    endVerse: number | null,
}

export const defaultExtractedBible: ExtractedBibleResult = {
    book: null,
    chapter: null,
    startVerse: null,
    endVerse: null,
};

async function searchBook(bibleKey: string, arr: string[]) {
    const bookVKList = await getBookVKList(bibleKey);
    if (bookVKList !== null) {
        if (arr.length) {
            let i = 0;
            while (++i <= arr.length) {
                const j = i;
                const bookKey = arr.filter((_, i1) => {
                    return i1 < j;
                }).join(' ');
                if (bookVKList[bookKey]) {
                    arr.splice(0, i);
                    return bookKey;
                }
            }
        }
    }
    throw new Error('Invalid book');
}

async function searchChapter(bibleKey: string,
    book: string, arr: string[]) {
    const error = new Error('Invalid chapter');
    if (!arr[0]) {
        throw error;
    }
    const chapterCount = await getChapterCount(bibleKey, book);
    if (chapterCount === null) {
        throw error;
    }
    const arr1 = arr[0].split(':');
    const chapter = await fromLocaleNumBB(bibleKey, arr1[0]);
    if (chapter === null || chapter < 1 ||
        chapter > chapterCount) {
        throw error;
    }
    arr1.shift();
    const bookKey = await bookToKey(bibleKey, book);
    const err1 = new Error('Invalid book');
    if (bookKey === null) {
        throw err1;
    }
    let verseCount = 0;
    if (arr1.length > 0) {
        const verses = await getVerses(bibleKey, bookKey, chapter);
        if (!verses) {
            throw err1;
        }
        verseCount = Object.keys(verses).length;
    }
    return { arr1, chapter, verseCount };
}

async function searchStartVerse(bibleKey: string,
    verseCount: number, arr1: string[]) {
    const error = new Error('Invalid start verse');
    if (!arr1[0]) {
        throw error;
    }
    const arr2 = arr1[0].split('-');
    const startVerse = await fromLocaleNumBB(bibleKey, arr2[0]);
    if (startVerse === null || startVerse < 0 ||
        startVerse > verseCount) {
        throw error;
    }
    arr2.shift();
    return { arr2, startVerse };
}

async function searchEndVerse(bibleKey: string, verseCount: number,
    startVerse: number, arr2: string[]) {
    const error = new Error('Invalid end verse');
    if (!arr2[0]) {
        throw error;
    }
    const endVerse = await fromLocaleNumBB(bibleKey, arr2[0]);
    if (endVerse === null || endVerse < 1 || endVerse > verseCount ||
        endVerse <= startVerse) {
        throw error;
    }
    return endVerse;
}

export async function extractBible(bibleKey: string, str: string) {
    const result = cloneJson(defaultExtractedBible);
    try {
        const arr = str.trim().split(/\s+/);
        result.book = await searchBook(bibleKey, arr);
        const {
            arr1, chapter, verseCount,
        } = await searchChapter(bibleKey, result.book, arr);
        if ((/^.+\s+.+:.*/).test(str)) {
            result.chapter = chapter;
        }
        const {
            arr2, startVerse,
        } = await searchStartVerse(bibleKey, verseCount, arr1);
        result.startVerse = startVerse;
        result.endVerse = startVerse;
        result.endVerse = await searchEndVerse(bibleKey,
            verseCount, startVerse, arr2);
    } catch (error: any) {
        if (error.message === 'Invalid book') {
            return cloneJson(defaultExtractedBible);
        }
    }
    return result;
}
