import { useCallback, useState } from 'react';
import InputHandler from './InputHandler';
import {
    ExtractedBibleResult, genExtractedBible, extractBibleTitle, toInputText,
} from '../helper/bible-helpers/serverBibleHelpers2';
import {
    genInputText, useGetSelectedBibleKey,
} from '../bible-list/bibleHelpers';
import RenderSearchSuggestion, {
    BibleNotAvailable,
} from './RenderSearchSuggestion';
import { useAppEffect } from '../helper/debuggerHelpers';
import { keyToBook } from '../helper/bible-helpers/bibleInfoHelpers';

export default function RenderBibleSearch({
    editingInputText,
}: {
    editingInputText: string,
}) {
    const [inputText, setInputText] = useState<string>(editingInputText);
    const [bibleKeySelected, setBibleKeySelected] = useGetSelectedBibleKey();

    const handleBibleChange = useCallback(async (
        oldBibleKey: string, newBibleKey: string) => {
        const newText = await genInputText(oldBibleKey, newBibleKey, inputText);
        setBibleKeySelected(newBibleKey);
        if (newText !== null) {
            setInputText(newText);
        }
    }, [inputText]);
    if (bibleKeySelected === null) {
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
                        bibleKey={bibleKeySelected}
                        onBibleChange={handleBibleChange} />
                </div>
            </div>
            <div className={
                'body card-body card w-100 h-100 overflow-hidden d-flex'
            }>
                <div className='found h-100 w-100 overflow-hidden'>
                    <RenderBibleSearchBody
                        bibleKey={bibleKeySelected}
                        inputText={inputText}
                        setInputText={setInputText} />
                </div>
            </div>
        </div>
    );
}

function RenderBibleSearchBody({
    bibleKey, inputText, setInputText,
}: {
    bibleKey: string,
    inputText: string,
    setInputText: (newText: string) => void,
}) {
    const [extractedInput, setExtractedInput] = useState<ExtractedBibleResult>(
        genExtractedBible(),
    );
    useAppEffect(() => {
        extractBibleTitle(bibleKey, inputText).then((result) => {
            console.log(bibleKey, inputText, result);

            setExtractedInput(result);
        });
    }, [bibleKey, inputText]);
    const applyBookSelectionCallback = useCallback(
        async (_: string, newBook: string) => {
            const newText = await toInputText(bibleKey, newBook);
            setInputText(newText);
        },
        [bibleKey, setInputText],
    );
    const applyChapterSelectionCallback = useCallback(
        async (newChapter: number) => {
            if (bibleKey === null || extractedInput.bookKey === null) {
                return;
            }
            const book = await keyToBook(bibleKey, extractedInput.bookKey);
            const newText = await toInputText(
                bibleKey, book, newChapter,
            );
            setInputText(`${newText}:`);
        },
        [bibleKey, extractedInput.bookKey, setInputText],
    );
    const applyVerseSelectionCallback = useCallback(async (
        newStartVerse?: number, newEndVerse?: number) => {
        if (bibleKey === null || extractedInput.bookKey === null) {
            return;
        }
        const book = await keyToBook(bibleKey, extractedInput.bookKey);
        const txt = await toInputText(
            bibleKey, book, extractedInput.chapter,
            newStartVerse, newEndVerse,
        );
        setInputText(txt);
    }, [
        bibleKey, extractedInput.bookKey,
        extractedInput.chapter, setInputText,
    ]);
    return (
        <RenderSearchSuggestion
            inputText={inputText}
            bibleKey={bibleKey}
            bibleResult={extractedInput}
            applyChapterSelection={applyChapterSelectionCallback}
            applyVerseSelection={applyVerseSelectionCallback}
            applyBookSelection={applyBookSelectionCallback} />
    );
}
