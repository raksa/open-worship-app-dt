import { useState } from 'react';
import BibleItem, { BibleTargetType } from '../../bible-list/BibleItem';
import { useAppEffect } from '../debuggerHelpers';
import { keyToBook, getVerses } from './bibleInfoHelpers';
import { getKJVKeyValue } from './serverBibleHelpers';
import { toInputText, toLocaleNumBB } from './serverBibleHelpers2';

type CallbackType = (text: string | null) => void;
class BibleRenderHelper {
    _callbackMapper: Map<string, Array<CallbackType>> = new Map();
    _pushCallback(key: string, callback: CallbackType) {
        const callbackList = this._callbackMapper.get(key) ?? [];
        callbackList.push(callback);
        this._callbackMapper.set(key, callbackList);
        return callbackList.length === 1;
    }
    _fullfilCallback(key: string, text: string | null) {
        const callbackList = this._callbackMapper.get(key) ?? [];
        this._callbackMapper.delete(key);
        callbackList.forEach((callback) => {
            callback(text);
        });
    }

    toBibleVersesKey(bibleKey: string,
        bibleTarget: BibleTargetType) {
        const { book, chapter, startVerse, endVerse } = bibleTarget;
        const txtV = `${startVerse}${startVerse !== endVerse ?
            ('-' + endVerse) : ''}`;
        return `${bibleKey} | ${book} ${chapter}:${txtV}`;
    }
    fromBibleVerseKey(bibleVersesKey: string) {
        let arr = bibleVersesKey.split(' | ');
        const bibleKey = arr[0];
        arr = arr[1].split(':');
        const [book, chapter] = arr[0].split(' ');
        const [startVerse, endVerse] = arr[1].split('-');
        return {
            bibleKey,
            book,
            chapter: Number(chapter),
            startVerse: Number(startVerse),
            endVerse: endVerse ? Number(endVerse) : Number(startVerse),
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
            startVerse, endVerse,
        } = this.fromBibleVerseKey(bibleVersesKey);
        const chapterLocale = await toLocaleNumBB(bible, chapter);
        const startVerseLocale = await toLocaleNumBB(bible, startVerse);
        const endVerseLocale = await toLocaleNumBB(bible, endVerse);
        const txtV = `${startVerseLocale}${startVerse !== endVerse ?
            ('-' + endVerseLocale) : ''}`;
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
            startVerse, endVerse,
        } = this.fromBibleVerseKey(bibleVersesKey);
        const verses = await getVerses(bible, book, chapter);
        if (!verses) {
            return null;
        }
        let txt = '';
        for (let i = startVerse; i <= endVerse; i++) {
            txt += ` (${await toLocaleNumBB(bible, i)}): ${verses[i.toString()]}`;
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
}

export const bibleRenderHelper = new BibleRenderHelper();

export function useBibleItemRenderTitle(item: BibleItem) {
    const [title, setTitle] = useState<string>('');
    useAppEffect(() => {
        item.toTitle().then(setTitle);
    }, [item]);
    return title;
}
export function useBibleItemRenderText(item: BibleItem) {
    const [text, setText] = useState<string>('');
    useAppEffect(() => {
        BibleItem.itemToText(item).then(setText);
    }, [item]);
    return text;
}
export function useBibleItemToInputText(bibleKey: string, book?: string | null,
    chapter?: number | null, startVerse?: number | null, endVerse?: number | null) {
    const [text, setText] = useState<string>('');
    useAppEffect(() => {
        toInputText(bibleKey, book, chapter, startVerse, endVerse).then((text1) => {
            setText(text1);
        });
    }, [bibleKey, book, chapter, startVerse, endVerse]);
    return text;
}
