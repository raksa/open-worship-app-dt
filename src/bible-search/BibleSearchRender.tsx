import { useCallback, useState } from 'react';
import {
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import InputHandler from './InputHandler';
import {
    ExtractedBibleResult, genExtractedBible, extractBibleTitle, toInputText,
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
    editingInputText,
}: {
    editingInputText: string,
}) {
    const [inputText, setInputText] = useState<string>(editingInputText);
    const [bibleKeySelected, setBibleKeySelected] = useGetSelectedBibleKey();

    const [bibleResult, setBibleResult] = useState<ExtractedBibleResult>(
        genExtractedBible(),
    );
    useAppEffect(() => {
        if (bibleKeySelected !== null) {
            extractBibleTitle(bibleKeySelected, inputText).then((result) => {
                console.log(bibleKeySelected, inputText, result);

                setBibleResult(result);
            });
        }
    }, [bibleKeySelected, inputText]);
    const applyBookSelectionCallback = useCallback(async (
        newBook: string) => {
        if (bibleKeySelected === null) {
            return;
        }
        const count = await getChapterCount(bibleKeySelected, newBook);
        if (count !== null) {
            setInputText(await toInputText(bibleKeySelected, newBook));
            return;
        }
        alert('Fail to generate input text');
    }, [bibleKeySelected, setInputText]);
    const applyChapterSelectionCallback = useCallback(
        async (newChapter: number) => {
            if (bibleKeySelected === null) {
                return;
            }
            const newText = await toInputText(bibleKeySelected,
                bibleResult.bookKey, newChapter,
            );
            setInputText(`${newText}:`);
        },
        [bibleKeySelected, bibleResult.bookKey, setInputText],
    );
    const applyVerseSelectionCallback = useCallback(async (
        newStartVerse?: number, newEndVerse?: number) => {
        if (bibleKeySelected === null) {
            return;
        }
        const txt = await toInputText(bibleKeySelected, bibleResult.bookKey,
            bibleResult.chapter, newStartVerse, newEndVerse);
        setInputText(txt);
    }, [
        bibleKeySelected, bibleResult.bookKey,
        bibleResult.chapter, setInputText,
    ]);
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
                    <RenderSearchSuggestion
                        inputText={inputText}
                        bibleKey={bibleKeySelected}
                        bibleResult={bibleResult}
                        applyChapterSelection={applyChapterSelectionCallback}
                        applyVerseSelection={applyVerseSelectionCallback}
                        applyBookSelection={applyBookSelectionCallback} />
                </div>
            </div>
        </div>
    );
}
