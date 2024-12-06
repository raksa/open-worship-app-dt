import { useCallback, useState } from 'react';

import {
    ExtractedBibleResult, genExtractedBible, extractBibleTitle, toInputText,
    parseChapterFromGuessing,
} from '../helper/bible-helpers/serverBibleHelpers2';
import RenderSearchSuggestion from './RenderSearchSuggestion';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { keyToBook } from '../helper/bible-helpers/bibleInfoHelpers';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import {
    SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import { useBibleKeyContext } from '../bible-list/bibleHelpers';
import { getInputTrueValue, useInputText } from './InputHandler';

let syncTimeoutId: any = null;
function checkShouldSync(
    oldResult: ExtractedBibleResult, newResult: ExtractedBibleResult,
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
    oldResult: ExtractedBibleResult, newResult: ExtractedBibleResult,
) {
    if (syncTimeoutId !== null) {
        clearTimeout(syncTimeoutId);
    }
    syncTimeoutId = setTimeout(() => {
        syncTimeoutId = null;
        if (checkShouldSync(oldResult, newResult)) {
            SearchBibleItemViewController.getInstance().syncBibleItems();
        }
    }, 100);
}

function useExtractInput(bibleKey: string, inputText: string) {
    const [extractedInput, setExtractedInput] = useState<ExtractedBibleResult>(
        genExtractedBible(),
    );
    useAppEffectAsync(async (methodContext) => {
        const extractedResult = await extractBibleTitle(bibleKey, inputText);
        const {
            result, bibleKey: bibleKey1, inputText: inputText1,
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
    }, [bibleKey, inputText], { methods: { setExtractedInput } });
    return extractedInput;
}

function useMethods(
    bibleKey: string, extractedInput: ExtractedBibleResult,
    inputText: string, setInputText: (text: string) => void,
) {
    useKeyboardRegistering([{ key: 'Tab' }], async (event) => {
        const { bookKey, guessingChapter, bibleItem } = extractedInput;
        if (bibleItem === null) {
            if (bookKey !== null && guessingChapter !== null) {
                const chapter = await parseChapterFromGuessing(
                    bibleKey, bookKey, guessingChapter,
                );
                if (chapter === null) {
                    return;
                }
                event.stopPropagation();
                event.preventDefault();
                setInputText(`${inputText}:`);
            }
        } else if (bibleItem.target.verseStart === bibleItem.target.verseEnd) {
            event.stopPropagation();
            event.preventDefault();
            setInputText(`${inputText}-`);
        }
    });
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
        newVerseStart?: number, newVerseEnd?: number) => {
        if (bibleKey === null || extractedInput.bookKey === null) {
            return;
        }
        const book = await keyToBook(bibleKey, extractedInput.bookKey);
        const txt = await toInputText(
            bibleKey, book, extractedInput.chapter,
            newVerseStart, newVerseEnd,
        );
        setInputText(txt);
    }, [
        bibleKey, extractedInput.bookKey,
        extractedInput.chapter, setInputText,
    ]);
    return {
        applyBookSelectionCallback,
        applyChapterSelectionCallback,
        applyVerseSelectionCallback,
    };
}

export default function RenderBibleSearchBody() {
    const { inputText } = useInputText();
    const viewController = SearchBibleItemViewController.getInstance();
    const bibleKey = useBibleKeyContext();;
    const setInputText = viewController.setInputText;
    const extractedInput = useExtractInput(bibleKey, inputText);
    const {
        applyBookSelectionCallback,
        applyChapterSelectionCallback,
        applyVerseSelectionCallback,
    } = useMethods(
        bibleKey, extractedInput, inputText, setInputText,
    );
    return (
        <RenderSearchSuggestion
            bibleResult={extractedInput}
            applyChapterSelection={applyChapterSelectionCallback}
            applyVerseSelection={applyVerseSelectionCallback}
            applyBookSelection={applyBookSelectionCallback}
        />
    );
}
