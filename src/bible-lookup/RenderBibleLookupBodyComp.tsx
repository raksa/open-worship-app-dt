import { useState } from 'react';

import {
    ExtractedBibleResult,
    genExtractedBible,
    extractBibleTitle,
    toInputText,
    parseChapterFromGuessing,
} from '../helper/bible-helpers/serverBibleHelpers2';
import RenderLookupSuggestionComp from './RenderLookupSuggestionComp';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { keyToBook } from '../helper/bible-helpers/bibleInfoHelpers';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import { useBibleKeyContext } from '../bible-list/bibleHelpers';
import { getInputTrueValue, useInputTextContext } from './InputHandlerComp';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';

let syncTimeoutId: any = null;
function checkShouldSync(
    oldResult: ExtractedBibleResult,
    newResult: ExtractedBibleResult,
) {
    if (oldResult.bibleItem === null && newResult.bibleItem !== null) {
        return true;
    }
    if (oldResult.bibleItem !== null && newResult.bibleItem !== null) {
        return !oldResult.bibleItem.checkIsTargetIdentical(newResult.bibleItem);
    }
    return false;
}

function checkAndSyncResult(
    oldResult: ExtractedBibleResult,
    newResult: ExtractedBibleResult,
) {
    if (syncTimeoutId !== null) {
        clearTimeout(syncTimeoutId);
    }
    syncTimeoutId = setTimeout(() => {
        syncTimeoutId = null;
        if (checkShouldSync(oldResult, newResult)) {
            LookupBibleItemViewController.getInstance().syncBibleItems();
        }
    }, 100);
}

function useExtractInput(bibleKey: string, inputText: string) {
    const [extractedInput, setExtractedInput] =
        useState<ExtractedBibleResult>(genExtractedBible());
    useAppEffectAsync(
        async (methodContext) => {
            const extractedResult = await extractBibleTitle(
                bibleKey,
                inputText,
            );
            const {
                result,
                bibleKey: bibleKey1,
                inputText: inputText1,
            } = extractedResult;
            const trueValue = getInputTrueValue();
            if (
                inputText1 &&
                (bibleKey1 !== bibleKey || inputText1 !== trueValue)
            ) {
                return;
            }
            methodContext.setExtractedInput((prev) => {
                checkAndSyncResult(prev, result);
                return result;
            });
        },
        [bibleKey, inputText],
        { setExtractedInput },
    );
    return extractedInput;
}

function useMethods(
    bibleKey: string,
    extractedInput: ExtractedBibleResult,
    inputText: string,
    setInputText: (text: string) => void,
) {
    useKeyboardRegistering(
        [{ key: 'Tab' }],
        async (event) => {
            const { bookKey, guessingChapter, bibleItem } = extractedInput;
            if (bibleItem === null) {
                if (bookKey !== null && guessingChapter !== null) {
                    const chapter = await parseChapterFromGuessing(
                        bibleKey,
                        bookKey,
                        guessingChapter,
                    );
                    if (chapter === null) {
                        return;
                    }
                    event.stopPropagation();
                    event.preventDefault();
                    setInputText(`${inputText}:`);
                }
            } else if (
                bibleItem.target.verseStart === bibleItem.target.verseEnd
            ) {
                event.stopPropagation();
                event.preventDefault();
                setInputText(`${inputText}-`);
            }
        },
        [bibleKey, extractedInput, inputText, setInputText],
    );
    const handleBookSelecting = async (_: string, newBook: string) => {
        const newText = await toInputText(bibleKey, newBook);
        setInputText(newText);
    };
    const handleChapterSelecting = async (newChapter: number) => {
        if (bibleKey === null || extractedInput.bookKey === null) {
            return;
        }
        const book = await keyToBook(bibleKey, extractedInput.bookKey);
        const newText = await toInputText(bibleKey, book, newChapter);
        setInputText(`${newText}:`);
    };
    const handleVerseSelecting = async (
        newVerseStart?: number,
        newVerseEnd?: number,
    ) => {
        if (bibleKey === null || extractedInput.bookKey === null) {
            return;
        }
        const book = await keyToBook(bibleKey, extractedInput.bookKey);
        const txt = await toInputText(
            bibleKey,
            book,
            extractedInput.chapter,
            newVerseStart,
            newVerseEnd,
        );
        setInputText(txt);
    };
    return {
        applyBookSelectionCallback: handleBookSelecting,
        applyChapterSelectionCallback: handleChapterSelecting,
        applyVerseSelectionCallback: handleVerseSelecting,
    };
}

export default function RenderBibleLookupBodyComp() {
    const { inputText } = useInputTextContext();
    const viewController = LookupBibleItemViewController.getInstance();
    const bibleKey = useBibleKeyContext();
    const setInputText = viewController.setInputText;
    const extractedInput = useExtractInput(bibleKey, inputText);
    const {
        applyBookSelectionCallback,
        applyChapterSelectionCallback,
        applyVerseSelectionCallback,
    } = useMethods(bibleKey, extractedInput, inputText, setInputText);
    return (
        <RenderLookupSuggestionComp
            bibleResult={extractedInput}
            applyChapterSelection={applyChapterSelectionCallback}
            applyVerseSelection={applyVerseSelectionCallback}
            applyBookSelection={applyBookSelectionCallback}
        />
    );
}
