import { useCallback, useState } from 'react';
import {
    EventMapper,
    toShortcutKey,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import InputHandler from './InputHandler';
import {
    ExtractedBibleResult,
    defaultExtractedBible,
    extractBible,
    toInputText,
} from '../server/bible-helpers/bibleHelpers2';
import {
    getChapterCount,
} from '../server/bible-helpers/bibleInfoHelpers';
import { closeBibleSearch } from './HandleBibleSearch';
import {
    genInputText, useGetSelectedBibleKey,
} from './bibleHelpers';
import RenderSearchSuggestion, {
    BibleNotAvailable,
} from './RenderSearchSuggestion';
import { useAppEffect } from '../helper/debuggerHelpers';

const eventMapper: EventMapper = {
    wControlKey: ['Ctrl'],
    mControlKey: ['Ctrl'],
    lControlKey: ['Ctrl'],
    key: 'q',
};

export default function BibleSearchRender({ editingInputText }: {
    editingInputText: string,
}) {
    const [inputText, setInputText] = useState<string>(editingInputText);

    const [bibleSelected, setBibleSelected] = useGetSelectedBibleKey();

    useKeyboardRegistering(eventMapper, () => {
        closeBibleSearch();
    });
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
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                }}>
                    <button type='button' onClick={closeBibleSearch}
                        data-tool-tip={toShortcutKey(eventMapper)}
                        className='btn btn-outline-danger m-2'>
                        <i className='bi bi-x-lg' />
                    </button>
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
