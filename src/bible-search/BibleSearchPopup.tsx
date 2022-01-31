import './BibleSearchPopup.scss';

import { useEffect, useState } from 'react';
import { KeyEnum, useKeyboardRegistering } from '../event/KeyboardEventListener';
import { getSetting, setSetting } from '../helper/settings';
import InputHandler from './InputHandler';
import RenderBookOption from './RenderBookOption';
import RenderChapterOption from './RenderChapterOption';
import Header from './Header';
import RenderFound from './RenderFound';
import {
    ExtractedBibleResult,
    defaultExtractedBible,
    extractBible,
    toInputText,
} from './bibleSearchHelpers';
import {
    StateEnum,
    WindowEnum,
    windowEventListener,
} from '../event/WindowEventListener';
import Modal from '../helper/Modal';
import Preview from './Preview';
import bibleHelper from '../bible-helper/bibleHelper';
import { getChapterCount, getBookKVList, biblePresentToTitle } from '../bible-helper/helpers';
import { getDefaultBibleList, getBibleListEditingIndex, clearBibleListEditingIndex } from '../bible-list/BibleList';
import { BiblePresentType } from '../full-text-present/fullTextPresentHelper';

export const openBibleSearchEvent = {
    window: WindowEnum.BibleSearch,
    state: StateEnum.Open,
};
export const closeBibleSearchEvent = {
    window: WindowEnum.BibleSearch,
    state: StateEnum.Close,
};
export const openBibleSearch = () => {
    windowEventListener.fireEvent(openBibleSearchEvent);
};
export const closeBibleSearch = () => {
    clearBibleListEditingIndex();
    windowEventListener.fireEvent(closeBibleSearchEvent);
};

export const getSelectedBible = (): string => {
    const editingIndex = getBibleListEditingIndex();
    if (editingIndex !== null) {
        const bibleList = getDefaultBibleList();
        if (bibleList[editingIndex]) {
            const biblePresent = bibleList[editingIndex] as BiblePresentType;
            return biblePresent.bible;
        }
    }
    let bible = getSetting('selected-bible');
    if (!bible) {
        const bibles = bibleHelper.getDownloadedBibleList();
        if (!bibles || !bibles.length) {
            throw new Error('No available bible');
        }
        setSetting('selected-bible', bibles[0]);
        return getSelectedBible();
    }
    return bible;
};

function getDefaultInputText() {
    const editingIndex = getBibleListEditingIndex();
    if (editingIndex !== null) {
        const bibleList = getDefaultBibleList();
        if (bibleList[editingIndex]) {
            const biblePresent = bibleList[editingIndex] as BiblePresentType;
            return biblePresentToTitle(biblePresent);
        }
    }
    return '';
}

export default function BibleSearchPopup() {
    const [inputText, setInputText] = useState(getDefaultInputText());
    const [bibleSelected, setBibleSelected] = useState(getSelectedBible());

    useKeyboardRegistering({ key: KeyEnum.Escape }, () => !inputText && closeBibleSearch());

    const [bibleResult, setBibleResult] = useState<ExtractedBibleResult>(defaultExtractedBible);

    useEffect(() => {
        extractBible(bibleSelected, inputText).then((result) => {
            setBibleResult(result);
        });
    }, [bibleSelected, inputText]);

    const { book, chapter, startVerse, endVerse } = bibleResult;


    const applyBookSelection = (book: string) => {
        const count = getChapterCount(bibleSelected, book);
        if (count !== null) {
            setInputText(toInputText(bibleSelected, book));
            return;
        }
        alert('Fail to generate input text');
    };
    const applyChapterSelection = (chapter: number) => {
        setInputText(`${toInputText(bibleSelected, book, chapter)}:`);
    };
    const applyVerseSelection = (startVerse?: number, endVerse?: number) => {
        const txt = toInputText(bibleSelected, book, chapter, startVerse, endVerse);
        setInputText(txt);
    };
    const handleBibleChange = async (preBible: string) => {
        const bible = getSelectedBible();
        setBibleSelected(bible);
        const result = await extractBible(preBible, inputText);
        const { book, chapter, startVerse, endVerse } = result;
        if (book !== null) {
            const bookObj = getBookKVList(preBible);
            const key = bookObj === null ? null : Object.keys(bookObj).find((k) => bookObj[k] === book);
            if (key) {
                const newBookObj = getBookKVList(bible);
                if (newBookObj !== null) {
                    setInputText(toInputText(bible, newBookObj[key], chapter, startVerse, endVerse));
                    return;
                }
            }
        }
        setInputText('');
    };

    return (
        <Modal>
            <div id="bible-search-popup" className="app-modal shadow card">
                <Header />
                <div className="body card-body w-100">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <InputHandler
                            inputText={inputText}
                            onInputChange={setInputText}
                            bibleSelected={bibleSelected}
                            onBibleChange={handleBibleChange} />
                    </div>
                    <div className="found">
                        {!book && <RenderBookOption
                            bibleSelected={bibleSelected}
                            inputText={inputText}
                            onSelect={applyBookSelection}
                        />}
                        {book && chapter === null && <RenderChapterOption
                            bibleSelected={bibleSelected}
                            bookSelected={book}
                            inputText={inputText}
                            onSelect={applyChapterSelection}
                        />}
                        {book && chapter !== null && <RenderFound
                            bibleSelected={bibleSelected}
                            book={book}
                            chapter={chapter}
                            startVerse={startVerse}
                            endVerse={endVerse}
                            applyChapterSelection={applyChapterSelection}
                            onVerseChange={(startVerse, endVerse) => {
                                applyVerseSelection(startVerse, endVerse)
                            }}
                        />}
                        {book && chapter !== null && <Preview
                            bibleSelected={bibleSelected}
                            book={book}
                            chapter={chapter}
                            startVerse={startVerse}
                            endVerse={endVerse}
                        />}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
