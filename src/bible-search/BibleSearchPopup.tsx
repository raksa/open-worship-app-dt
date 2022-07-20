import './BibleSearchPopup.scss';

import { useEffect, useState } from 'react';
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
    windowEventListener.fireEvent(closeBibleSearchEvent);
    BibleItem.setSelectedEditingItem(null);
}

export async function getSelectedEditingBibleItem(bibleItem: BibleItem | null) {
    if (bibleItem !== null) {
        return bibleItem.bibleName;
    }
    const bibleName = getSetting('selected-bible') || null;
    if (bibleName === null) {
        const bibleNames = await bibleHelper.getDownloadedBibleList();
        if (!bibleNames || !bibleNames.length) {
            toastEventListener.showSimpleToast({
                title: 'Getting Selected Bible',
                message: 'Unable to get selected bible',
            });
            return null;
        }
        setSetting('selected-bible', bibleNames[0]);
        return bibleNames[0];
    }
    return bibleName;
}
export function useGetSelectedBibleItem(bibleItem: BibleItem | null) {
    const [bibleNameSelected, setBibleNameSelected] = useState<string | null>(null);
    useEffect(() => {
        getSelectedEditingBibleItem(bibleItem).then((bibleName) => {
            setBibleNameSelected(bibleName);
        });
    });
    return [bibleNameSelected, setBibleNameSelected] as [string | null, (b: string | null) => void];
}
function useGetDefaultInputText(bibleItem: BibleItem | null) {
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
export default function BibleSearchPopup() {
    const [bibleItem, setBibleItem] = useState<BibleItem | null>(null);
    useEffect(() => {
        BibleItem.getSelectedItemEditing().then((item) => {
            setBibleItem(item || null);
        });
    });
    return (
        <Modal>
            <BibleSearchRender bibleItem={bibleItem} />
        </Modal>
    );
}

function BibleSearchRender({ bibleItem }: { bibleItem: BibleItem | null }) {
    const [inputText, setInputText] = useGetDefaultInputText(bibleItem);
    const [bibleSelected, setBibleSelected] = useGetSelectedBibleItem(bibleItem);

    useKeyboardRegistering({ key: KeyEnum.Escape }, () => {
        !inputText && closeBibleSearch();
    });

    const [bibleResult, setBibleResult] = useState<ExtractedBibleResult>(
        defaultExtractedBible);

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
                <div id='bible-search-popup' className='app-modal shadow card'>
                    <Header />
                    <div className='body card-body w-100'>
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
        const bible = await getSelectedEditingBibleItem(null);
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
        <div id='bible-search-popup' className='app-modal shadow card'>
            <Header />
            <div className='body card-body w-100'>
                <div className='input-group'>
                    <span className='input-group-text'>
                        <i className='bi bi-search'></i>
                    </span>
                    <InputHandler
                        inputText={inputText}
                        onInputChange={setInputText}
                        bibleSelected={bibleSelected}
                        onBibleChange={handleBibleChange} />
                </div>
                <div className='found'>
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
    );
}
