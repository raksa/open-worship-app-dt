import {
    bookToKey,
    getBibleInfo,
    getBookVKList,
    getChapterCount,
    getVerses,
} from './helpers1';
import { cloneObject } from '../../helper/helpers';
import { useEffect, useState } from 'react';
import { fromLocaleNum, LocalType, toLocaleNum } from '../../lang';

export async function toInputText(bibleName: string,
    book?: string | null, chapter?: number | null,
    startVerse?: number | null, endVerse?: number | null) {
    let txt = '';
    if (book) {
        txt += `${book} `;
        if (chapter !== undefined && chapter !== null) {
            txt += `${await toLocaleNumBB(bibleName, chapter)}`;
            if (startVerse !== undefined && startVerse !== null) {
                txt += `:${await toLocaleNumBB(bibleName, startVerse)}`;
                if (endVerse !== undefined && endVerse !== null &&
                    endVerse !== startVerse) {
                    txt += `-${await toLocaleNumBB(bibleName, endVerse)}`;
                }
            }
        }
    }
    return txt;
}

export async function toLocaleNumBB(bibleName: string, n: number | null) {
    if (typeof n !== 'number') {
        return null;
    }
    const info = await getBibleInfo(bibleName);
    if (info === null) {
        return `${n}`;
    }
    return toLocaleNum(info.locale as LocalType, n);
}
export function useToLocaleNumBB(bibleName: string, nString: number | null) {
    const [str, setStr] = useState<string | null>(null);
    useEffect(() => {
        toLocaleNumBB(bibleName, nString).then(setStr);
    }, [bibleName, nString]);
    return str;
}

export async function fromLocaleNumBB(bibleName: string, localeNum: string) {
    const info = await getBibleInfo(bibleName);
    if (info === null) {
        return null;
    }
    return fromLocaleNum(info.locale as LocalType, localeNum);
}
export function useFromLocaleNumBB(bibleName: string, localeNum: string) {
    const [n, setN] = useState<number | null>(null);
    useEffect(() => {
        fromLocaleNumBB(bibleName, localeNum).then(setN);
    }, [bibleName, localeNum]);
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

async function searchBook(bibleName: string, arr: string[]) {
    const bookVKList = await getBookVKList(bibleName);
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
async function searchChapter(bibleName: string,
    book: string, arr: string[]) {
    const error = new Error('Invalid chapter');
    if (!arr[0]) {
        throw error;
    }
    const chapterCount = await getChapterCount(bibleName, book);
    if (chapterCount === null) {
        throw error;
    }
    const arr1 = arr[0].split(':');
    const chapter = await fromLocaleNumBB(bibleName, arr1[0]);
    if (chapter === null || chapter < 1 ||
        chapter > chapterCount) {
        throw error;
    }
    arr1.shift();
    const bookKey = await bookToKey(bibleName, book);
    const err1 = new Error('Invalid book');
    if (bookKey === null) {
        throw err1;
    }
    const verses = await getVerses(bibleName, bookKey, chapter);
    if (!verses) {
        throw err1;
    }
    const verseCount = Object.keys(verses).length;
    return { arr1, chapter, verseCount };
}
async function searchStartVerse(bibleName: string,
    verseCount: number, arr1: string[]) {
    const error = new Error('Invalid start verse');
    if (!arr1[0]) {
        throw error;
    }
    const arr2 = arr1[0].split('-');
    const startVerse = await fromLocaleNumBB(bibleName, arr2[0]);
    if (startVerse === null || startVerse < 0 ||
        startVerse > verseCount) {
        throw error;
    }
    arr2.shift();
    return { arr2, startVerse };
}
async function searchEndVerse(bibleName: string, verseCount: number,
    startVerse: number, arr2: string[]) {
    const error = new Error('Invalid end verse');
    if (!arr2[0]) {
        throw error;
    }
    const endVerse = await fromLocaleNumBB(bibleName, arr2[0]);
    if (endVerse === null || endVerse < 1 || endVerse > verseCount ||
        endVerse <= startVerse) {
        throw error;
    }
    return endVerse;
}
export async function extractBible(bibleName: string, str: string) {
    const result = cloneObject(defaultExtractedBible);
    try {
        const arr = str.trim().split(/\s+/);
        result.book = await searchBook(bibleName, arr);
        const {
            arr1, chapter, verseCount,
        } = await searchChapter(bibleName, result.book, arr);
        result.chapter = chapter;
        const {
            arr2, startVerse,
        } = await searchStartVerse(bibleName, verseCount, arr1);
        result.startVerse = startVerse;
        result.endVerse = startVerse;
        result.endVerse = await searchEndVerse(bibleName,
            verseCount, startVerse, arr2);
    } catch (error: any) {
        if (error.message === 'Invalid book') {
            return cloneObject(defaultExtractedBible);
        }
    }
    return result;
}
