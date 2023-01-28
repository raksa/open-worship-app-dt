import { useEffect, useState } from 'react';
import { getSetting, setSetting } from '../helper/settingHelper';
import BibleItem from '../bible-list/BibleItem';
import {
    getBookKVList,
    bookToKey,
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
import { ConsumeVerseType } from './RenderFound';
import { closeBibleSearch } from './HandleBibleSearch';
import { showSimpleToast } from '../toast/toastHelpers';
import CanvasController from '../slide-editor/canvas/CanvasController';

export async function getSelectedEditingBibleItem(bibleItem: BibleItem | null) {
    if (bibleItem !== null) {
        return bibleItem.bibleKey;
    }
    let bibleKey = getSetting('selected-bible') || null;
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

export function useGetSelectedBibleItem(bibleItem: BibleItem | null) {
    const [bibleKeySelected, setBibleKeySelected] = useState<string | null>(null);
    useEffect(() => {
        getSelectedEditingBibleItem(bibleItem).then((bibleKey) => {
            setBibleKeySelected(bibleKey);
        });
    });
    return [bibleKeySelected, setBibleKeySelected] as [string | null, (b: string | null) => void];
}

export function useGetDefaultInputText(bibleItem: BibleItem | null) {
    const [inputText, setInputText] = useState<string>('');
    useEffect(() => {
        if (bibleItem !== null) {
            BibleItem.itemToTitle(bibleItem).then((text) => {
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
        const key = bookObj === null ? null : Object.keys(bookObj).find((k) => {
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
