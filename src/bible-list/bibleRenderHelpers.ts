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
    bibleKey: string;
    kjvBibleVersesKey: string;
    bibleVersesKey: string;
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
    toKJVBibleVersesKey(bibleTarget: BibleTargetType) {
        const { bookKey: book, chapter, verseStart, verseEnd } = bibleTarget;
        const txtV = `${verseStart}${
            verseStart !== verseEnd ? '-' + verseEnd : ''
        }`;
        return `${book} ${chapter}:${txtV}`;
    }
    toBibleVersesKey(bibleKey: string, bibleTarget: BibleTargetType) {
        return `${bibleKey} | ${this.toKJVBibleVersesKey(bibleTarget)}`;
    }
    fromKJVBibleVersesKey(kjvBibleVersesKey: string) {
        const arr = kjvBibleVersesKey.split(':');
        const [book, chapter] = arr[0].split(' ');
        const [verseStart, verseEnd] = arr[1].split('-');
        return {
            book,
            chapter: Number(chapter),
            verseStart: Number(verseStart),
            verseEnd: verseEnd ? Number(verseEnd) : Number(verseStart),
        };
    }
    fromBibleVerseKey(bibleVersesKey: string) {
        const arr = bibleVersesKey.split(' | ');
        const bibleKey = arr[0];
        return {
            bibleKey,
            ...this.fromKJVBibleVersesKey(arr[1]),
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
                bibleKey,
                kjvBibleVersesKey: this.toKJVBibleVersesKey({
                    bookKey: book,
                    chapter,
                    verseStart: i,
                    verseEnd: i,
                }),
                bibleVersesKey: this.toBibleVersesKey(bibleKey, {
                    bookKey: book,
                    chapter,
                    verseStart: i,
                    verseEnd: i,
                }),
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
        const booksOrder = bibleObj.booksOrder;
        const bookIndex = booksOrder.findIndex(
            (bookKey1) => bookKey1 === bookKey,
        );
        let nextBookIndex = bookIndex;
        let nextChapter = chapter + (isNext ? 1 : -1);
        if (nextChapter < 1 || nextChapter > getKJVChapterCount(bookKey)) {
            const bookLength = booksOrder.length;
            nextBookIndex =
                (bookLength + nextBookIndex + (isNext ? 1 : -1)) % bookLength;
            nextChapter = isNext
                ? 1
                : getKJVChapterCount(booksOrder[nextBookIndex]);
        }
        const verses = await getVerses(bibleKey, bookKey, nextChapter);
        return {
            bookKey: booksOrder[nextBookIndex],
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
