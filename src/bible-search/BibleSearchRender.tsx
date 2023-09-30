import { useCallback, useState } from 'react';
import {
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import InputHandler from './InputHandler';
import {
    ExtractedBibleResult,
    defaultExtractedBible,
    extractBible,
    toInputText,
} from '../helper/bible-helpers/serverBibleHelpers2';
import {
    getChapterCount,
} from '../helper/bible-helpers/bibleInfoHelpers';
import {
    genInputText, useGetSelectedBibleKey,
} from '../bible-list/bibleHelpers';
import RenderSearchSuggestion, {
    BibleNotAvailable,
} from './RenderSearchSuggestion';
import { useAppEffect } from '../helper/debuggerHelpers';

export default function BibleSearchRender({
    editingInputText, closeBibleSearch,
}: {
    editingInputText: string,
    closeBibleSearch: () => void,
}) {
    const [inputText, setInputText] = useState<string>(editingInputText);
    const [bibleSelected, setBibleSelected] = useGetSelectedBibleKey();

    useKeyboardRegistering({ key: 'Escape' }, () => {
        if (!inputText) {
            closeBibleSearch();
        }
    });
    const [bibleResult, setBibleResult] = useState<ExtractedBibleResult>(
        defaultExtractedBible);
    useAppEffect(() => {
        if (bibleSelected !== null) {
            extractBible(bibleSelected, inputText).then((result) => {
                setBibleResult(result);
            });
        }
    }, [bibleSelected, inputText]);
    const applyBookSelectionCallback = useCallback(async (
        newBook: string) => {
        if (bibleSelected === null) {
            return;
        }
        const count = await getChapterCount(bibleSelected, newBook);
        if (count !== null) {
            setInputText(await toInputText(bibleSelected, newBook));
            return;
        }
        alert('Fail to generate input text');
    }, [bibleSelected, setInputText]);
    const applyChapterSelectionCallback = useCallback(async (
        newChapter: number) => {
        if (bibleSelected === null) {
            return;
        }
        const newText = await toInputText(bibleSelected,
            bibleResult.book, newChapter);
        setInputText(`${newText}:`);
    }, [bibleSelected, bibleResult.book, setInputText]);
    const applyVerseSelectionCallback = useCallback(async (
        newStartVerse?: number, newEndVerse?: number) => {
        if (bibleSelected === null) {
            return;
        }
        const txt = await toInputText(bibleSelected, bibleResult.book,
            bibleResult.chapter, newStartVerse, newEndVerse);
        setInputText(txt);
    }, [
        bibleSelected, bibleResult.book,
        bibleResult.chapter, setInputText,
    ]);
    const handleBibleChange = useCallback(async (
        oldBibleKey: string, newBibleKey: string) => {
        const newText = await genInputText(oldBibleKey, newBibleKey, inputText);
        setBibleSelected(newBibleKey);
        if (newText !== null) {
            setInputText(newText);
        }
    }, [inputText]);
    if (bibleSelected === null) {
        return (
            <BibleNotAvailable />
        );
    }
    return (
        <div id='bible-search-popup' className='app-modal shadow card'>
            <div className='card-header text-center w-100'>
                <div className='input-group input-group-header'>
                    <span className='input-group-text'>
                        <i className='bi bi-search' />
                    </span>
                    <InputHandler
                        inputText={inputText}
                        onInputChange={setInputText}
                        bibleSelected={bibleSelected}
                        onBibleChange={handleBibleChange} />
                </div>
            </div>
            <div className='body card-body card w-100 h-100 overflow-hidden d-flex'>
                <div className='found h-100 w-100 overflow-hidden'>
                    <RenderSearchSuggestion
                        inputText={inputText}
                        bibleSelected={bibleSelected}
                        bibleResult={bibleResult}
                        applyChapterSelection={applyChapterSelectionCallback}
                        applyVerseSelection={applyVerseSelectionCallback}
                        applyBookSelection={applyBookSelectionCallback} />
                </div>
            </div>
        </div>
    );
}
