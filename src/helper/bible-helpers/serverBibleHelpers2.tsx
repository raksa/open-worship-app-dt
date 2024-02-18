import { useState } from 'react';
import {
    bookToKey, getBibleInfo, getVerses,
} from './bibleInfoHelpers';
import {
    fromLocaleNum, LocaleType, toLocaleNum,
} from '../../lang';
import { useAppEffect } from '../debuggerHelpers';
import BibleItem from '../../bible-list/BibleItem';
import { getKJVChapterCount } from './serverBibleHelpers';

export async function toInputText(
    bibleKey: string, book?: string | null, chapter?: number | null,
    verseStart?: number | null, verseEnd?: number | null,
) {
    let txt = '';
    if (book) {
        txt += `${book} `;
        if (chapter !== undefined && chapter !== null) {
            txt += `${await toLocaleNumBB(bibleKey, chapter)}`;
            if (verseStart !== undefined && verseStart !== null) {
                txt += `:${await toLocaleNumBB(bibleKey, verseStart)}`;
                if (verseEnd !== undefined && verseEnd !== null &&
                    verseEnd !== verseStart) {
                    txt += `-${await toLocaleNumBB(bibleKey, verseEnd)}`;
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
    bookKey: string | null,
    guessingBook: string | null,
    chapter: number | null,
    guessingChapter: string | null,
    bibleItem: BibleItem | null,
}

export function genExtractedBible(): ExtractedBibleResult {
    return {
        bookKey: null,
        guessingBook: null,
        chapter: null,
        guessingChapter: null,
        bibleItem: null,
    };
}

export async function parseChapterFromGuessing(
    bibleKey: string, bookKey: string, chapter: string,
) {
    const chapterNum = await fromLocaleNumBB(bibleKey, chapter);
    const chapterCount = getKJVChapterCount(bookKey);
    if (chapterNum === null || chapterNum < 1 || chapterNum > chapterCount) {
        return null;
    }
    return chapterNum;
}

async function transformExtracted(
    bibleKey: string, book: string, chapter: string | null,
    verseStart: string | null, verseEnd: string | null,
): Promise<ExtractedBibleResult | null> {
    const result = genExtractedBible();
    result.guessingBook = book;
    result.guessingChapter = chapter;
    if (book === null) {
        return result;
    }
    const bookKey = await bookToKey(bibleKey, book);
    if (bookKey === null) {
        return null;
    }
    result.bookKey = bookKey;
    result.guessingBook = null;
    if (chapter === null) {
        return result;
    }
    if (chapter.endsWith(':')) {
        chapter = chapter.replace(':', '');
        result.guessingChapter = chapter;
    } else if (verseStart === null && verseEnd === null) {
        return result;
    }
    const chapterNum = await parseChapterFromGuessing(
        bibleKey, bookKey, chapter,
    );
    if (chapterNum === null) {
        return result;
    }
    const verses = await getVerses(bibleKey, bookKey, chapterNum);
    if (verses === null) {
        return result;
    }
    result.chapter = chapterNum;
    result.guessingChapter = null;
    const verseCount = Object.keys(verses).length;
    result.bibleItem = BibleItem.fromData(
        bibleKey, bookKey, chapterNum, 1, verseCount,
    );
    if (verseStart === null || verseEnd === null) {
        return result;
    }
    const target = result.bibleItem.target;
    const verseStartNum = await fromLocaleNumBB(bibleKey, verseStart);
    if (verseStartNum !== null) {
        target.verseStart = verseStartNum;
    }
    const verseEndNum = await fromLocaleNumBB(bibleKey, verseEnd);
    if (verseEndNum !== null) {
        target.verseEnd = verseEndNum;
    }
    const { verseStart: sVerse, verseEnd: eVerse } = target;
    if (eVerse < 1 || eVerse < sVerse || sVerse > verseCount) {
        target.verseStart = 1;
        target.verseEnd = verseCount;
    }
    return result;
}
const regexTitleMap: [
    string, (
        bibleKey: string, matches: RegExpMatchArray,
    ) => Promise<ExtractedBibleResult | null>,
][] = [
        // "1 John 1:1-2"
        ['(^.+)\\s(.+):(.+)-(.+)$', async (bibleKey, matches) => {
            if (matches.length !== 5) {
                return null;
            }
            const [_, book, chapter, verseStart, verseEnd] = matches;
            return transformExtracted(
                bibleKey, book, chapter, verseStart, verseEnd,
            );
        }],
        // "1 John 1:1-"
        ['(^.+)\\s(.+):(.+)-$', async (bibleKey, matches) => {
            if (matches.length !== 5) {
                return null;
            }
            const [_, book, chapter, verseStart] = matches;
            const verseEnd = null;
            return transformExtracted(
                bibleKey, book, chapter, verseStart, verseEnd,
            );
        }],
        // "1 John 1:1"
        ['(^.+)\\s(.+):(.+)$', async (bibleKey, matches) => {
            if (matches.length !== 4) {
                return null;
            }
            const [_, book, chapter, verse] = matches;
            const verseStart = verse;
            const verseEnd = verse;
            return transformExtracted(
                bibleKey, book, chapter, verseStart, verseEnd,
            );
        }],
        // "1 John 1:"
        ['(^.+)\\s(.+)$', async (bibleKey, matches) => {
            if (matches.length !== 3) {
                return null;
            }
            const [_, book, chapter] = matches;
            const verseStart = null;
            const verseEnd = null;
            return transformExtracted(
                bibleKey, book, chapter, verseStart, verseEnd,
            );
        }],
        // "1 John"
        ['(^.+)$', async (bibleKey, matches) => {
            if (matches.length !== 2) {
                return null;
            }
            const [_, book] = matches;
            const chapter = null;
            const verseStart = null;
            const verseEnd = null;
            return transformExtracted(
                bibleKey, book, chapter, verseStart, verseEnd,
            );
        }],
    ];
export async function extractBibleTitle(bibleKey: string, inputText: string) {
    const cleanText = inputText.trim().replace(/\s+/g, ' ');
    if (cleanText === '') {
        return genExtractedBible();
    }
    debugger;
    for (const [regexStr, matcher] of regexTitleMap) {
        const regex = new RegExp(regexStr);
        const matches = regex.exec(cleanText);
        if (matches === null) {
            continue;
        }
        const result = await matcher(bibleKey, matches);
        if (result !== null) {
            return result;
        }
    };
    const result = genExtractedBible();
    result.guessingBook = cleanText;
    return result;
}
