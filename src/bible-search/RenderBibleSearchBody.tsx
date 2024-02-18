import { useCallback, useState } from 'react';
import {
    ExtractedBibleResult, genExtractedBible, extractBibleTitle, toInputText,
    parseChapterFromGuessing,
} from '../helper/bible-helpers/serverBibleHelpers2';
import RenderSearchSuggestion from './RenderSearchSuggestion';
import { useAppEffect } from '../helper/debuggerHelpers';
import { keyToBook } from '../helper/bible-helpers/bibleInfoHelpers';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import BibleItem from '../bible-list/BibleItem';
import { toMaxId } from '../helper/helpers';
import RenderPinnedBibleItems from './RenderPinnedBibleItems';


export default function RenderBibleSearchBody({
    bibleKey, inputText, setInputText,
}: Readonly<{
    bibleKey: string,
    inputText: string,
    setInputText: (newText: string) => void,
}>) {
    const [pinnedBibleItems, setPinnedBibleItems] = useState<BibleItem[]>([]);
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
        if (
            bibleItem === null && bookKey !== null && guessingChapter !== null
        ) {
            parseChapterFromGuessing(
                bibleKey, bookKey, guessingChapter,
            ).then((chapter) => {
                if (chapter === null) {
                    return;
                }
                event.stopPropagation();
                event.preventDefault();
                setInputText(inputText + ':');
            });
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
        newverseStart?: number, newverseEnd?: number) => {
        if (bibleKey === null || extractedInput.bookKey === null) {
            return;
        }
        const book = await keyToBook(bibleKey, extractedInput.bookKey);
        const txt = await toInputText(
            bibleKey, book, extractedInput.chapter,
            newverseStart, newverseEnd,
        );
        setInputText(txt);
    }, [
        bibleKey, extractedInput.bookKey,
        extractedInput.chapter, setInputText,
    ]);
    const pinningBibleItem = useCallback((currentBibleItem: BibleItem) => {
        const newBibleItem = currentBibleItem.clone();
        const maxId = toMaxId(
            pinnedBibleItems.map((bibleItem) => {
                return bibleItem.id;
            }),
        );
        newBibleItem.id = maxId + 1;
        setPinnedBibleItems([...pinnedBibleItems, newBibleItem]);
    }, [extractedInput.bibleItem, pinnedBibleItems]);
    return (
        <div className='d-flex w-100 h-100'>
            {pinnedBibleItems.length > 0 ?
                <RenderPinnedBibleItems
                    pinnedBibleItems={pinnedBibleItems}
                    setPinnedBibleItems={setPinnedBibleItems}
                /> : null
            }
            <RenderSearchSuggestion
                inputText={inputText}
                bibleKey={bibleKey}
                bibleResult={extractedInput}
                applyChapterSelection={applyChapterSelectionCallback}
                applyVerseSelection={applyVerseSelectionCallback}
                applyBookSelection={applyBookSelectionCallback}
                pinningBibleItem={pinningBibleItem} />
        </div>
    );
}
