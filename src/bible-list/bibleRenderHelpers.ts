import {
    keyToBook,
    getVerses,
    getBibleInfo,
} from '../helper/bible-helpers/bibleInfoHelpers';
import {
    bibleObj,
    getKJVChapterCount,
    getKJVKeyValue,
} from '../helper/bible-helpers/serverBibleHelpers';
import {
    getBibleLocale,
    toLocaleNumBible,
} from '../helper/bible-helpers/serverBibleHelpers2';
import { getLangAsync } from '../lang';

export type BibleTargetType = {
    bookKey: string;
    chapter: number;
    verseStart: number;
    verseEnd: number;
};

export type CompiledVerseType = {
    verse: number;
    localeVerse: string;
    text: string;
    isNewLine: boolean;
};

type CallbackType<T extends string | CompiledVerseType[]> = (
    _: T | null,
) => void;
const cache: Map<string, Array<CallbackType<any>>> = new Map();
class BibleRenderHelper {
    private pushCallback(key: string, callback: CallbackType<any>) {
        const callbackList = cache.get(key) ?? [];
        callbackList.push(callback);
        cache.set(key, callbackList);
        return callbackList.length === 1;
    }
    private fullfilCallback(key: string, result: any) {
        const callbackList = cache.get(key) ?? [];
        cache.delete(key);
        callbackList.forEach((callback) => {
            callback(result);
        });
    }

    toBibleVersesKey(bibleKey: string, bibleTarget: BibleTargetType) {
        const { bookKey: book, chapter, verseStart, verseEnd } = bibleTarget;
        const txtV = `${verseStart}${
            verseStart !== verseEnd ? '-' + verseEnd : ''
        }`;
        return `${bibleKey} | ${book} ${chapter}:${txtV}`;
    }
    fromBibleVerseKey(bibleVersesKey: string) {
        let arr = bibleVersesKey.split(' | ');
        const bibleKey = arr[0];
        arr = arr[1].split(':');
        const [book, chapter] = arr[0].split(' ');
        const [verseStart, verseEnd] = arr[1].split('-');
        return {
            bibleKey,
            book,
            chapter: Number(chapter),
            verseStart: Number(verseStart),
            verseEnd: verseEnd ? Number(verseEnd) : Number(verseStart),
        };
    }

    toTitleQueueKey(bibleVersesKey: string) {
        return `title > ${bibleVersesKey}`;
    }
    toVerseTextListQueueKey(bibleVersesKey: string) {
        return `text > ${bibleVersesKey}`;
    }

    async _toTitle(bibleVersesKey: string, callback: CallbackType<string>) {
        const cacheKey = this.toTitleQueueKey(bibleVersesKey);
        const isFist = this.pushCallback(cacheKey, callback);
        if (!isFist) {
            return;
        }
        const {
            bibleKey: bible,
            book,
            chapter,
            verseStart,
            verseEnd,
        } = this.fromBibleVerseKey(bibleVersesKey);
        const chapterLocale = await toLocaleNumBible(bible, chapter);
        const verseStartLocale = await toLocaleNumBible(bible, verseStart);
        const verseEndLocale = await toLocaleNumBible(bible, verseEnd);
        const txtV = `${verseStartLocale}${
            verseStart !== verseEnd ? '-' + verseEndLocale : ''
        }`;
        let bookKey = await keyToBook(bible, book);
        if (bookKey === null) {
            bookKey = getKJVKeyValue()[book];
        }
        const title = `${bookKey} ${chapterLocale}:${txtV}`;
        this.fullfilCallback(cacheKey, title);
    }
    toTitle(bibleKey: string, target: BibleTargetType) {
        return new Promise<string>((resolve) => {
            const bibleVersesKey = bibleRenderHelper.toBibleVersesKey(
                bibleKey,
                target,
            );
            this._toTitle(bibleVersesKey, (title) => {
                if (title === null) {
                    resolve(`😟Unable to render text for ${bibleVersesKey}`);
                    return;
                }
                resolve(title);
            });
        });
    }

    async _toVerseTextList(
        bibleVersesKey: string,
        callback: CallbackType<CompiledVerseType[]>,
    ) {
        const cacheKey = this.toVerseTextListQueueKey(bibleVersesKey);
        const isFist = this.pushCallback(cacheKey, callback);
        if (!isFist) {
            return;
        }
        const { bibleKey, book, chapter, verseStart, verseEnd } =
            this.fromBibleVerseKey(bibleVersesKey);
        const verses = await getVerses(bibleKey, book, chapter);
        if (!verses) {
            return null;
        }
        const locale = await getBibleLocale(bibleKey);
        const langData = await getLangAsync(locale);
        const result: CompiledVerseType[] = [];
        for (let i = verseStart; i <= verseEnd; i++) {
            const localNum = await toLocaleNumBible(bibleKey, i);
            let isNewLine = i == 1;
            if (langData !== null && i > 1) {
                isNewLine = langData.checkShouldNewLine(
                    verses[(i - 1).toString()] ?? '??',
                );
            }
            const iString = i.toString();
            result.push({
                verse: i,
                localeVerse: localNum ?? iString,
                text: verses[iString] ?? '??',
                isNewLine,
            });
        }
        return this.fullfilCallback(cacheKey, result);
    }
    toVerseTextList(bibleKey: string, target: BibleTargetType) {
        const bibleVersesKey = bibleRenderHelper.toBibleVersesKey(
            bibleKey,
            target,
        );
        return new Promise<CompiledVerseType[] | null>((resolve) => {
            this._toVerseTextList(bibleVersesKey, (result) => {
                resolve(result);
            });
        });
    }
    async getJumpingChapter(
        bibleKey: string,
        target: BibleTargetType,
        isNext: boolean,
    ): Promise<BibleTargetType | null> {
        const { bookKey, chapter } = target;
        const bibleInfo = await getBibleInfo(bibleKey);
        if (bibleInfo === null) {
            return null;
        }
        let nextBookKey = bookKey;
        let nextChapter;
        const chapterCount = getKJVChapterCount(bookKey);
        // TODO: simplify this
        if (isNext) {
            if (chapter < chapterCount) {
                nextChapter = chapter + 1;
            } else {
                const booksOrder = bibleObj.booksOrder;
                const bookIndex = booksOrder.findIndex(
                    (bookKey1) => bookKey1 === bookKey,
                );
                if (bookIndex < 0 || bookIndex + 1 >= booksOrder.length) {
                    return null;
                }
                nextChapter = 1;
                nextBookKey = booksOrder[bookIndex + 1];
            }
        } else {
            if (chapter > 1) {
                nextChapter = chapter - 1;
            } else {
                const booksOrder = bibleObj.booksOrder;
                const bookIndex = booksOrder.findIndex(
                    (bookKey1) => bookKey1 === bookKey,
                );
                if (bookIndex <= 0) {
                    return null;
                }
                nextChapter = getKJVChapterCount(booksOrder[bookIndex - 1]);
                nextBookKey = booksOrder[bookIndex - 1];
            }
        }
        const verses = await getVerses(bibleKey, bookKey, nextChapter);
        return {
            bookKey: nextBookKey,
            chapter: nextChapter,
            verseStart: 1,
            verseEnd: verses ? Object.keys(verses).length : 1,
        };
    }
    async toText(bibleKey: string, target: BibleTargetType) {
        const verseTextList = await this.toVerseTextList(bibleKey, target);
        if (verseTextList === null) {
            const bibleVersesKey = bibleRenderHelper.toBibleVersesKey(
                bibleKey,
                target,
            );
            return `😟Unable to render text for ${bibleVersesKey}`;
        }
        return verseTextList
            .map(({ localeVerse, text }) => {
                return `(${localeVerse}): ${text}`;
            })
            .join(' ');
    }
}

export const bibleRenderHelper = new BibleRenderHelper();
