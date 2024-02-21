import {
    keyToBook, getVerses,
} from '../helper/bible-helpers/bibleInfoHelpers';
import {
    getKJVKeyValue,
} from '../helper/bible-helpers/serverBibleHelpers';
import {
    toLocaleNumBB,
} from '../helper/bible-helpers/serverBibleHelpers2';

export type BibleTargetType = {
    bookKey: string,
    chapter: number,
    verseStart: number,
    verseEnd: number,
};

type CallbackType = (text: string | null) => void;
class BibleRenderHelper {
    _callbackMapper: Map<string, Array<CallbackType>> = new Map();
    _pushCallback(key: string, callback: CallbackType) {
        const callbackList = this._callbackMapper.get(key) || [];
        callbackList.push(callback);
        this._callbackMapper.set(key, callbackList);
        return callbackList.length === 1;
    }
    _fullfilCallback(key: string, text: string | null) {
        const callbackList = this._callbackMapper.get(key) || [];
        this._callbackMapper.delete(key);
        callbackList.forEach((callback) => {
            callback(text);
        });
    }

    toBibleVersesKey(bibleKey: string,
        bibleTarget: BibleTargetType) {
        const { bookKey: book, chapter, verseStart, verseEnd } = bibleTarget;
        const txtV = `${verseStart}${verseStart !== verseEnd ?
            ('-' + verseEnd) : ''}`;
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
    toTextQueueKey(bibleVersesKey: string) {
        return `text > ${bibleVersesKey}`;
    }

    async _toTitle(bibleVersesKey: string, callback: CallbackType) {
        const cacheKey = this.toTitleQueueKey(bibleVersesKey);
        const isFist = this._pushCallback(cacheKey, callback);
        if (!isFist) {
            return;
        }
        const {
            bibleKey: bible,
            book, chapter,
            verseStart, verseEnd,
        } = this.fromBibleVerseKey(bibleVersesKey);
        const chapterLocale = await toLocaleNumBB(bible, chapter);
        const verseStartLocale = await toLocaleNumBB(bible, verseStart);
        const verseEndLocale = await toLocaleNumBB(bible, verseEnd);
        const txtV = `${verseStartLocale}${verseStart !== verseEnd ?
            ('-' + verseEndLocale) : ''}`;
        let bookKey = await keyToBook(bible, book);
        if (bookKey === null) {
            bookKey = getKJVKeyValue()[book];
        }
        const title = `${bookKey} ${chapterLocale}:${txtV}`;
        this._fullfilCallback(cacheKey, title);
    }
    toTitle(bibleVersesKey: string) {
        return new Promise<string | null>((resolve) => {
            this._toTitle(bibleVersesKey, (title) => {
                resolve(title);
            });
        });
    }

    async _toText(bibleVersesKey: string, callback: CallbackType) {
        const cacheKey = this.toTextQueueKey(bibleVersesKey);
        const isFist = this._pushCallback(cacheKey, callback);
        if (!isFist) {
            return;
        }
        const {
            bibleKey: bible,
            book, chapter,
            verseStart, verseEnd,
        } = this.fromBibleVerseKey(bibleVersesKey);
        const verses = await getVerses(bible, book, chapter);
        if (!verses) {
            return null;
        }
        let txt = '';
        for (let i = verseStart; i <= verseEnd; i++) {
            const localNum = await toLocaleNumBB(bible, i);
            txt += ` (${localNum}): ${verses[i.toString()] ?? '??'}`;
        }
        return this._fullfilCallback(cacheKey, txt);
    }
    toText(bibleVersesKey: string) {
        return new Promise<string | null>((resolve) => {
            this._toText(bibleVersesKey, (text) => {
                resolve(text);
            });
        });
    }
    async bibleItemToText(bibleKey: string, target: BibleTargetType) {
        const bibleVerseKey = bibleRenderHelper
            .toBibleVersesKey(bibleKey, target);
        return (
            await this.toText(bibleVerseKey) ||
            `😟Unable to render text for ${bibleVerseKey}`
        );
    }
}

export const bibleRenderHelper = new BibleRenderHelper();
