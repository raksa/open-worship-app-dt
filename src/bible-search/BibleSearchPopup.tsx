import './BibleSearchPopup.scss';

import {
    Dispatch, SetStateAction, useEffect, useState,
} from 'react';
import {
    KeyEnum, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { getSetting, setSetting } from '../helper/settingHelper';
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
} from '../bible-helper/helpers2';
import {
    StateEnum,
    WindowEnum,
    windowEventListener,
} from '../event/WindowEventListener';
import Modal from '../others/Modal';
import Preview from './Preview';
import bibleHelper from '../bible-helper/bibleHelpers';
import {
    getChapterCount,
    getBookKVList,
} from '../bible-helper/helpers1';
import { toastEventListener } from '../event/ToastEventListener';
import BibleItem from '../bible-list/BibleItem';

export const openBibleSearchEvent = {
    window: WindowEnum.BibleSearch,
    state: StateEnum.Open,
};
export const closeBibleSearchEvent = {
    window: WindowEnum.BibleSearch,
    state: StateEnum.Close,
};
export function openBibleSearch() {
    windowEventListener.fireEvent(openBibleSearchEvent);
}
export function closeBibleSearch() {
    BibleItem.clearBibleListEditingIndex();
    windowEventListener.fireEvent(closeBibleSearchEvent);
}

export async function getSelectedBible(): Promise<string | null> {
    const bibleItem = await BibleItem.getSelectedBibleItem();
    if (bibleItem !== null) {
        return bibleItem.bible;
    }
    const bible = getSetting('selected-bible') || null;
    if (bible === null) {
        const bibles = await bibleHelper.getDownloadedBibleList();
        if (!bibles || !bibles.length) {
            toastEventListener.showSimpleToast({
                title: 'Getting Selected Bible',
                message: 'Unable to get selected bible',
            });
            return null;
        }
        setSetting('selected-bible', bibles[0]);
        return getSelectedBible();
    }
    return bible;
}
export function useGetSelectedBible() {
    const [bibleSelected, setBibleSelected] = useState<string | null>(null);
    useEffect(() => {
        getSelectedBible().then((bible) => {
            setBibleSelected(bible);
        });
    });
    return [bibleSelected, setBibleSelected] as [string | null, (b: string | null) => void];
}
function useGetDefaultInputText(): [string, Dispatch<SetStateAction<string>>] {
    const [inputText, setInputText] = useState<string>('');
    useEffect(() => {
        BibleItem.getSelectedBibleItem().then(async (bibleItem) => {
            if (bibleItem !== null) {
                const text = await BibleItem.bibleItemToTitle(bibleItem);
                setInputText(text);
            }
        });
    });
    return [inputText, setInputText];
}
export default function BibleSearchPopup() {
    const [inputText, setInputText] = useGetDefaultInputText();
    const [bibleSelected, setBibleSelected] = useGetSelectedBible();

    useKeyboardRegistering({ key: KeyEnum.Escape }, () => !inputText && closeBibleSearch());

    const [bibleResult, setBibleResult] = useState<ExtractedBibleResult>(defaultExtractedBible);

    useEffect(() => {
        if (bibleSelected !== null) {
            extractBible(bibleSelected, inputText).then((result) => {
                setBibleResult(result);
            });
        }
    }, [bibleSelected, inputText]);

    if (bibleSelected === null) {
        return (
            <Modal>
                <div id="bible-search-popup" className="app-modal shadow card">
                    <Header />
                    <div className="body card-body w-100">
                        Bible not available!
                    </div>
                </div>
            </Modal>
        );
    }

    const { book, chapter, startVerse, endVerse } = bibleResult;

    const applyBookSelection = async (newBook: string) => {
        const count = await getChapterCount(bibleSelected, newBook);
        if (count !== null) {
            setInputText(await toInputText(bibleSelected, newBook));
            return;
        }
        alert('Fail to generate input text');
    };
    const applyChapterSelection = async (newChapter: number) => {
        setInputText(`${await toInputText(bibleSelected, book, newChapter)}:`);
    };
    const applyVerseSelection = async (newStartVerse?: number, newEndVerse?: number) => {
        const txt = await toInputText(bibleSelected, book, chapter, newStartVerse, newEndVerse);
        setInputText(txt);
    };
    const handleBibleChange = async (preBible: string) => {
        const bible = await getSelectedBible();
        if (bible == null) {
            return;
        }
        setBibleSelected(bible);
        const result = await extractBible(preBible, inputText);
        const { book: newBook, chapter: newChapter, startVerse: newStartVerse, endVerse: newEndVerse } = result;
        if (newBook !== null) {
            const bookObj = await getBookKVList(preBible);
            const key = bookObj === null ? null : Object.keys(bookObj).find((k) => bookObj[k] === newBook);
            if (key) {
                const newBookObj = await getBookKVList(bible);
                if (newBookObj !== null) {
                    setInputText(await toInputText(bible, newBookObj[key],
                        newChapter, newStartVerse, newEndVerse));
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
                            onVerseChange={(newStartVerse, newEndVerse) => {
                                applyVerseSelection(newStartVerse, newEndVerse);
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
