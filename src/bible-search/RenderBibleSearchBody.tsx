import { useCallback, useContext, useState } from 'react';

import {
    ExtractedBibleResult, genExtractedBible, extractBibleTitle, toInputText,
    parseChapterFromGuessing,
} from '../helper/bible-helpers/serverBibleHelpers2';
import RenderSearchSuggestion from './RenderSearchSuggestion';
import { useAppEffect } from '../helper/debuggerHelpers';
import { keyToBook } from '../helper/bible-helpers/bibleInfoHelpers';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import {
    SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import { SelectedBibleKeyContext } from '../bible-list/bibleHelpers';


export default function RenderBibleSearchBody({ inputText }: Readonly<{
    inputText: string,
}>) {
    const bibleKey = useContext(SelectedBibleKeyContext);
    const setInputText = (
        SearchBibleItemViewController.getInstance().setInputText
    );
    const [extractedInput, setExtractedInput] = useState<ExtractedBibleResult>(
        genExtractedBible(),
    );
    useAppEffect(() => {
        extractBibleTitle(bibleKey, inputText).then((result) => {
            setExtractedInput(result);
        });
    }, [bibleKey, inputText]);
    useKeyboardRegistering([{ key: 'Tab' }], (event) => {
        const { bookKey, guessingChapter, bibleItem } = extractedInput;
        if (bibleItem === null) {
            if (bookKey !== null && guessingChapter !== null) {
                parseChapterFromGuessing(
                    bibleKey, bookKey, guessingChapter,
                ).then((chapter) => {
                    if (chapter === null) {
                        return;
                    }
                    event.stopPropagation();
                    event.preventDefault();
                    setInputText(`${inputText}:`);
                });
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
    return (
        <RenderSearchSuggestion
            bibleResult={extractedInput}
            applyChapterSelection={applyChapterSelectionCallback}
            applyVerseSelection={applyVerseSelectionCallback}
            applyBookSelection={applyBookSelectionCallback}
        />
    );
}
