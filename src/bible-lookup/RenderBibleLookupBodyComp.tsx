import {
    ExtractedBibleResult,
    toInputText,
    parseChapterFromGuessing,
} from '../helper/bible-helpers/serverBibleHelpers2';
import RenderLookupSuggestionComp from './RenderLookupSuggestionComp';
import { keyToBook } from '../helper/bible-helpers/bibleInfoHelpers';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import { useBibleKeyContext } from '../bible-list/bibleHelpers';
import {
    useEditingResultContext,
    useLookupBibleItemControllerContext,
} from '../bible-reader/LookupBibleItemController';
import { useInputTextContext } from './InputHandlerComp';

function useMethods(
    bibleKey: string,
    extractedInput: ExtractedBibleResult,
    setInputText: (text: string) => void,
) {
    const { inputText } = useInputTextContext();
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
    const bibleKey = useBibleKeyContext();
    const editingResult = useEditingResultContext();
    const { applyBookSelectionCallback, applyChapterSelectionCallback } =
        useMethods(bibleKey, editingResult.result, (text: string) => {
            viewController.inputText = text;
        });
    return (
        <RenderLookupSuggestionComp
            bibleResult={editingResult.result}
            applyChapterSelection={applyChapterSelectionCallback}
            applyBookSelection={applyBookSelectionCallback}
        />
    );
}
