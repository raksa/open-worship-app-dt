import { keyToBook, getVerses } from '../helper/bible-helpers/bibleInfoHelpers';
import { getKJVKeyValue } from '../helper/bible-helpers/serverBibleHelpers';
import { toLocaleNumBible } from '../helper/bible-helpers/serverBibleHelpers2';

export type BibleTargetType = {
    bookKey: string;
    chapter: number;
    verseStart: number;
    verseEnd: number;
};

type CallbackType<T extends string | [string, string][]> = (
    _: T | null,
) => void;
const callbackMapper: Map<string, Array<CallbackType<any>>> = new Map();
class BibleRenderHelper {
    private pushCallback(key: string, callback: CallbackType<any>) {
        const callbackList = callbackMapper.get(key) ?? [];
        callbackList.push(callback);
        callbackMapper.set(key, callbackList);
        return callbackList.length === 1;
    }
    private fullfilCallback(key: string, result: any) {
        const callbackList = callbackMapper.get(key) ?? [];
        callbackMapper.delete(key);
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
        callback: CallbackType<[string, string][]>,
    ) {
        const cacheKey = this.toVerseTextListQueueKey(bibleVersesKey);
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
        const verses = await getVerses(bible, book, chapter);
        if (!verses) {
            return null;
        }
        const result: [string, string][] = [];
        for (let i = verseStart; i <= verseEnd; i++) {
            const localNum = await toLocaleNumBible(bible, i);
            const iString = i.toString();
            result.push([localNum ?? iString, verses[iString] ?? '??']);
        }
        return this.fullfilCallback(cacheKey, result);
    }
    toVerseTextList(bibleKey: string, target: BibleTargetType) {
        const bibleVersesKey = bibleRenderHelper.toBibleVersesKey(
            bibleKey,
            target,
        );
        return new Promise<[string, string][] | null>((resolve) => {
            this._toVerseTextList(bibleVersesKey, (result) => {
                resolve(result);
            });
        });
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
            .map(([verse, text]) => {
                return `(${verse}): ${text}`;
            })
            .join(' ');
    }
}

export const bibleRenderHelper = new BibleRenderHelper();
