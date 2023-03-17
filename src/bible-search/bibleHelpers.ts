import { useState } from 'react';
import { getSetting, setSetting } from '../helper/settingHelper';
import BibleItem from '../bible-list/BibleItem';
import {
    getBookKVList,
    bookToKey,
    VerseList,
    getVerses,
} from '../server/bible-helpers/bibleInfoHelpers';
import {
    extractBible,
    toInputText,
} from '../server/bible-helpers/bibleHelpers2';
import {
    getDownloadedBibleInfoList,
} from '../server/bible-helpers/bibleDownloadHelpers';
import { isWindowEditingMode } from '../App';
import Bible from '../bible-list/Bible';
import { closeBibleSearch } from './HandleBibleSearch';
import { showSimpleToast } from '../toast/toastHelpers';
import CanvasController from '../slide-editor/canvas/CanvasController';
import { useAppEffect } from '../helper/debuggerHelpers';

export const SELECTED_BIBLE_SETTING_NAME = 'selected-bible';
async function getSelectedEditingBibleItem() {
    let bibleKey = getSetting(SELECTED_BIBLE_SETTING_NAME) || null;
    if (bibleKey === null) {
        const downloadedBibleInfoList = await getDownloadedBibleInfoList();
        if (!downloadedBibleInfoList || !downloadedBibleInfoList.length) {
            showSimpleToast('Getting Selected Bible',
                'Unable to get selected bible');
            return null;
        }
        bibleKey = downloadedBibleInfoList[0].key;
        setSetting('selected-bible', bibleKey);
    }
    return bibleKey;
}
export function useGetSelectedBibleKey() {
    const [bibleKeySelected, _setBibleKeySelected] = useState<string | null>(
        null);
    const setBibleKeySelected = (bibleKey: string | null) => {
        setSetting(SELECTED_BIBLE_SETTING_NAME, bibleKey || '');
        _setBibleKeySelected(bibleKey);
    };
    useAppEffect(() => {
        getSelectedEditingBibleItem().then((bibleKey) => {
            setBibleKeySelected(bibleKey);
        });
    });
    return [bibleKeySelected, setBibleKeySelected] as
        [string | null, (b: string | null) => void];
}

export function useGetDefaultInputText(bibleItem: BibleItem | null) {
    const [inputText, setInputText] = useState<string>('');
    useAppEffect(() => {
        if (bibleItem !== null) {
            bibleItem.toTitle().then((text) => {
                setInputText(text);
            });
        }
    }, [bibleItem]);
    return [inputText, setInputText] as [string, (s: string) => void];
}

export async function genInputText(preBible: string,
    bibleKey: string, inputText: string) {
    const result = await extractBible(preBible, inputText);
    const {
        book: newBook,
        chapter: newChapter,
        startVerse: newStartVerse,
        endVerse: newEndVerse,
    } = result;
    if (newBook !== null) {
        const bookObj = await getBookKVList(preBible);
        const key = bookObj === null ? null : Object.keys(bookObj)
            .find((k) => {
                return bookObj[k] === newBook;
            });
        if (key) {
            const newBookObj = await getBookKVList(bibleKey);
            if (newBookObj !== null) {
                return toInputText(bibleKey, newBookObj[key],
                    newChapter, newStartVerse, newEndVerse);
            }
        }
    }
    return '';
}

export type AddBiblePropsType = {
    found: ConsumeVerseType,
    book: string,
    chapter: number,
    bibleSelected: string,
};

export async function addBibleItem({
    found, book, chapter,
    bibleSelected,
}: AddBiblePropsType) {
    const isWindowEditing = isWindowEditingMode();
    const key = await bookToKey(bibleSelected, book);
    if (key === null) {
        return null;
    }
    const bibleItem = BibleItem.fromJson({
        id: -1,
        bibleKey: bibleSelected,
        target: {
            book: key,
            chapter,
            startVerse: found.sVerse,
            endVerse: found.eVerse,
        },
        metadata: {},
    });
    if (isWindowEditing) {
        const canvasController = CanvasController.getInstance();
        canvasController.addNewBibleItem(bibleItem);
        closeBibleSearch();
        return null;
    }
    const savedBibleItem = await Bible.updateOrToDefault(bibleItem);
    if (savedBibleItem !== null) {
        closeBibleSearch();
        return savedBibleItem;
    } else {
        showSimpleToast('Adding bible', 'Fail to add bible to list');
    }
    return null;
};


export type ConsumeVerseType = {
    sVerse: number,
    eVerse: number,
    verses: VerseList,
};
export async function consumeStartVerseEndVerse(
    book: string,
    chapter: number,
    startVerse: number | null,
    endVerse: number | null,
    bibleSelected: string,
) {
    const bookKey = await bookToKey(bibleSelected, book);
    if (bookKey === null) {
        return null;
    }
    const verses = await getVerses(bibleSelected, bookKey, chapter);
    if (verses === null) {
        return null;
    }
    const verseCount = Object.keys(verses).length;
    const sVerse = startVerse !== null ? startVerse : 1;
    const eVerse = endVerse !== null ? endVerse : verseCount;
    const result: ConsumeVerseType = {
        verses,
        sVerse,
        eVerse,
    };
    return result;
}
