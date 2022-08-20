import { useEffect, useState } from 'react';
import {
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import InputHandler from './InputHandler';
import Header from './Header';
import {
    ExtractedBibleResult,
    defaultExtractedBible,
    extractBible,
    toInputText,
} from '../server/bible-helpers/bibleHelpers2';
import {
    getChapterCount,
} from '../server/bible-helpers/bibleHelpers1';
import BibleItem from '../bible-list/BibleItem';
import { closeBibleSearch } from './HandleBibleSearch';
import {
    useGetDefaultInputText,
    useGetSelectedBibleItem,
    getSelectedEditingBibleItem,
    genInputText,
} from './bibleHelpers';
import RenderSearchSuggestion, {
    BibleNotAvailable,
} from './RenderSearchSuggestion';

export default function BibleSearchRender({ bibleItem }: {
    bibleItem: BibleItem | null,
}) {
    const [inputText, setInputText] = useGetDefaultInputText(bibleItem);
    const [bibleSelected, setBibleSelected] = useGetSelectedBibleItem(bibleItem);
    useKeyboardRegistering({ key: 'Escape' }, () => {
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
            <BibleNotAvailable />
        );
    }
    const applyBookSelection = async (newBook: string) => {
        const count = await getChapterCount(bibleSelected, newBook);
        if (count !== null) {
            setInputText(await toInputText(bibleSelected, newBook));
            return;
        }
        alert('Fail to generate input text');
    };
    const applyChapterSelection = async (newChapter: number) => {
        const newText = await toInputText(bibleSelected,
            bibleResult.book, newChapter);
        setInputText(`${newText}:`);
    };
    const applyVerseSelection = async (newStartVerse?: number, newEndVerse?: number) => {
        const txt = await toInputText(bibleSelected, bibleResult.book,
            bibleResult.chapter, newStartVerse, newEndVerse);
        setInputText(txt);
    };
    const handleBibleChange = async (preBible: string) => {
        const bibleName = await getSelectedEditingBibleItem(null);
        if (bibleName === null) {
            return;
        }
        setBibleSelected(bibleName);
        const newText = await genInputText(preBible, bibleName, inputText);
        if (newText !== null) {
            setInputText(newText);
        }
    };

    return (
        <div id='bible-search-popup'
            className='app-modal shadow card'>
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
                <RenderSearchSuggestion
                    inputText={inputText}
                    bibleSelected={bibleSelected}
                    bibleResult={bibleResult}
                    applyChapterSelection={applyChapterSelection}
                    applyVerseSelection={applyVerseSelection}
                    applyBookSelection={applyBookSelection} />
            </div>
        </div>
    );
}
