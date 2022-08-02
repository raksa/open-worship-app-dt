import {
    bookToKey,
    getBibleNumList,
    getBookVKList,
    getChapterCount,
    getVerses,
} from './helpers1';
import { cloneObject } from '../helper/helpers';
import { useEffect, useState } from 'react';

export async function toInputText(bibleName: string, book?: string | null, chapter?: number | null,
    startVerse?: number | null, endVerse?: number | null) {
    let txt = '';
    if (book) {
        txt += `${book} `;
        if (chapter !== undefined && chapter !== null) {
            txt += `${await toLocaleNumber(bibleName, chapter)}`;
            if (startVerse !== undefined && startVerse !== null) {
                txt += `:${await toLocaleNumber(bibleName, startVerse)}`;
                if (endVerse !== undefined && endVerse !== null && endVerse !== startVerse) {
                    txt += `-${await toLocaleNumber(bibleName, endVerse)}`;
                }
            }
        }
    }
    return txt;
}

export async function toLocaleNumber(bibleName: string, n: string | number | null) {
    if (n === null) {
        return '';
    }
    const numList = await getBibleNumList(bibleName);
    if (numList === null) {
        return `${n}`;
    }
    return `${n}`.split('').map(n1 => {
        if (numList[+n1]) {
            return numList[+n1];
        }
        return n1;
    }).join('');
}
export function useToLocaleNumber(bibleName: string, nString: string | number | null) {
    const [str, setStr] = useState<string | null>(null);
    useEffect(() => {
        toLocaleNumber(bibleName, nString).then(setStr);
    }, [bibleName, nString]);
    return str;
}

export async function fromLocaleNumber(bibleName: string, localeNum: string | number) {
    const numList = await getBibleNumList(bibleName);
    if (numList === null) {
        return +`${localeNum}`;
    }
    return +`${localeNum}`.split('').map(n => {
        const ind = numList.indexOf(n);
        if (~ind) {
            return ind;
        }
        return n;
    }).join('');
}
export function useFromLocaleNumber(bibleName: string, localeNum: string | number) {
    const [n, setN] = useState<number | null>(null);
    useEffect(() => {
        fromLocaleNumber(bibleName, localeNum).then(setN);
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

export async function extractBible(bibleName: string, str: string) {
    str = str.trim();
    const arr = str.split(/\s+/);
    const result = cloneObject(defaultExtractedBible);
    const bookVKList = await getBookVKList(bibleName);
    if (bookVKList === null) {
        return result;
    }
    if (arr.length) {
        let i = 0;
        while (++i <= arr.length) {
            const j = i;
            const k = arr.filter((_, i1) => i1 < j).join(' ');
            if (bookVKList[k]) {
                result.book = k;
                arr.splice(0, i);
            }
        }
    }
    if (result.book === null) {
        return result;
    }
    const chapterCount = await getChapterCount(bibleName, result.book);
    if (chapterCount === null || !arr[0]) {
        return result;
    }
    const arr1 = arr[0].split(':');
    const chapter = await fromLocaleNumber(bibleName, arr1[0]);
    if (isNaN(chapter) || chapter < 1 || chapter > chapterCount) {
        return result;
    }
    result.chapter = chapter;
    arr1.shift();
    if (!arr1[0]) {
        return result;
    }
    const num = await fromLocaleNumber(bibleName, result.chapter);
    if (num === null) {
        return result;
    }
    const bookKey = await bookToKey(bibleName, result.book);
    if (bookKey === null) {
        return result;
    }
    const verses = await getVerses(bibleName, bookKey, num);
    if (!verses) {
        result.book = null;
        result.chapter = null;
        return result;
    }
    const verseCount = Object.keys(verses).length;
    const arr2 = arr1[0].split('-');
    const startVerse = await fromLocaleNumber(bibleName, arr2[0]);
    if (isNaN(startVerse) || startVerse < 0 || startVerse > verseCount) {
        return result;
    }
    result.startVerse = startVerse;
    result.endVerse = startVerse;
    arr2.shift();
    if (!arr2[0]) {
        return result;
    }
    const endVerse = await fromLocaleNumber(bibleName, arr2[0]);
    if (isNaN(endVerse) || endVerse < 1 || endVerse > verseCount ||
        endVerse <= result.startVerse) {
        return result;
    }
    result.endVerse = endVerse;
    return result;
}
