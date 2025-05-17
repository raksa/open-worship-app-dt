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
import LookupBibleItemController, {
    useLookupBibleItemControllerContext,
} from '../bible-reader/LookupBibleItemController';

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
    viewController: LookupBibleItemController,
    oldResult: ExtractedBibleResult,
    newResult: ExtractedBibleResult,
) {
    if (syncTimeoutId !== null) {
        clearTimeout(syncTimeoutId);
    }
    syncTimeoutId = setTimeout(() => {
        syncTimeoutId = null;
        if (checkShouldSync(oldResult, newResult)) {
            viewController.syncTargetByColorNote(
                viewController.selectedBibleItem,
            );
        }
    }, 100);
}

function useExtractInput(bibleKey: string, inputText: string) {
    const [extractedInput, setExtractedInput] =
        useState<ExtractedBibleResult>(genExtractedBible());
    const viewController = useLookupBibleItemControllerContext();
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
            const { bibleItem: foundBibleItem } = result;
            if (foundBibleItem !== null) {
                const selectedBibleItem = viewController.selectedBibleItem;
                foundBibleItem.id = selectedBibleItem.id;
                viewController.applyTargetOrBibleKey(
                    selectedBibleItem,
                    foundBibleItem,
                );
            }
            methodContext.setExtractedInput((previousResult) => {
                checkAndSyncResult(viewController, previousResult, result);
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
    return {
        applyBookSelectionCallback: handleBookSelecting,
        applyChapterSelectionCallback: handleChapterSelecting,
    };
}

export default function RenderBibleLookupBodyComp() {
    const viewController = useLookupBibleItemControllerContext();
    const { inputText } = useInputTextContext();
    const bibleKey = useBibleKeyContext();
    const extractedInput = useExtractInput(bibleKey, inputText);
    const { applyBookSelectionCallback, applyChapterSelectionCallback } =
        useMethods(bibleKey, extractedInput, inputText, (text: string) => {
            viewController.inputText = text;
        });
    return (
        <RenderLookupSuggestionComp
            bibleResult={extractedInput}
            applyChapterSelection={applyChapterSelectionCallback}
            applyBookSelection={applyBookSelectionCallback}
        />
    );
}
