import {
    toInputText,
    parseChapterFromGuessing,
    EditingResultType,
} from '../helper/bible-helpers/serverBibleHelpers2';
import RenderLookupSuggestionComp from './RenderLookupSuggestionComp';
import { keyToBook } from '../helper/bible-helpers/bibleInfoHelpers';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import { useBibleKeyContext } from '../bible-list/bibleHelpers';
import LookupBibleItemController, {
    EditingResultContext,
    useLookupBibleItemControllerContext,
} from '../bible-reader/LookupBibleItemController';
import { use } from 'react';

async function handleTab(
    event: KeyboardEvent,
    viewController: LookupBibleItemController,
    editingResult: EditingResultType,
) {
    const { bookKey, guessingChapter, bibleItem } = editingResult.result;
    if (bibleItem === null) {
        if (bookKey !== null && guessingChapter !== null) {
            const chapter = await parseChapterFromGuessing(
                viewController.selectedBibleItem.bibleKey,
                bookKey,
                guessingChapter,
            );
            if (chapter === null) {
                return;
            }
            event.stopPropagation();
            event.preventDefault();
            viewController.inputText = `${editingResult.oldInputText}:`;
        }
    } else if (bibleItem.target.verseStart === bibleItem.target.verseEnd) {
        event.stopPropagation();
        event.preventDefault();
        viewController.inputText = `${editingResult.oldInputText}-`;
    }
}

export default function RenderBibleLookupBodyComp() {
    const viewController = useLookupBibleItemControllerContext();
    const bibleKey = useBibleKeyContext();
    const editingResult = use(EditingResultContext);
    useKeyboardRegistering(
        [{ key: 'Tab' }],
        async (event) => {
            if (editingResult === null) {
                return;
            }
            handleTab(event, viewController, editingResult);
        },
        [],
    );
    const handleBookSelecting = async (_: string, newBook: string) => {
        const newText = await toInputText(bibleKey, newBook);
        viewController.inputText = newText;
    };
    const handleChapterSelecting = async (newChapter: number) => {
        if (editingResult === null) {
            return;
        }
        if (bibleKey === null || editingResult.result.bookKey === null) {
            return;
        }
        const book = await keyToBook(bibleKey, editingResult.result.bookKey);
        const newText = await toInputText(bibleKey, book, newChapter);
        viewController.inputText = `${newText}:`;
    };
    return (
        <RenderLookupSuggestionComp
            applyChapterSelection={handleChapterSelecting}
            applyBookSelection={handleBookSelecting}
        />
    );
}
