import RenderBookOptionsComp from './RenderBookOptionsComp';
import RenderChapterOptionsComp from './RenderChapterOptionsComp';
import { BibleSelectionMiniComp } from './BibleSelectionComp';
import { RENDER_FOUND_CLASS } from './selectionHelpers';
import { BibleViewTextComp } from '../bible-reader/BibleViewExtra';
import { BibleItemContext } from '../bible-reader/BibleItemContext';
import {
    useEditingResultContext,
    useLookupBibleItemControllerContext,
} from '../bible-reader/LookupBibleItemController';
import RenderVerseOptionsComp from './RenderVerseOptionsComp';

export default function RenderLookupSuggestionComp({
    applyChapterSelection,
    applyBookSelection,
}: Readonly<{
    applyChapterSelection: (newChapter: number) => void;
    applyBookSelection: (newBookKey: string, newBook: string) => void;
}>) {
    const editingResult = useEditingResultContext();
    const { bookKey, guessingBook, chapter, guessingChapter, bibleItem } =
        editingResult.result;

    if (bibleItem !== null) {
        return (
            <BibleItemContext value={bibleItem}>
                <RenderVerseOptionsComp />
                <BibleViewTextComp />
            </BibleItemContext>
        );
    }
    return (
        <div
            className={`found w-100 h-100 app-focusable ${RENDER_FOUND_CLASS}`}
            style={{ overflowY: 'auto' }}
            tabIndex={0}
            onClick={(event) => {
                event.currentTarget.focus();
            }}
        >
            <div
                className={
                    'w-100  d-flex flex-wrap align-items-start ' +
                    'justify-content-start'
                }
            >
                <RenderBookOptionsComp
                    bookKey={bookKey}
                    guessingBook={guessingBook}
                    onSelect={applyBookSelection}
                />
                <RenderChapterOptionsComp
                    bookKey={bookKey}
                    chapter={chapter}
                    guessingChapter={guessingChapter}
                    onSelect={applyChapterSelection}
                />
            </div>
        </div>
    );
}

export function BibleNotAvailableComp({
    bibleKey,
}: Readonly<{
    bibleKey: string;
}>) {
    const viewController = useLookupBibleItemControllerContext();
    const handleBibleKeyChanging = (
        _oldBibleKey: string,
        newBibleKey: string,
    ) => {
        viewController.applyTargetOrBibleKey(viewController.selectedBibleItem, {
            bibleKey: newBibleKey,
        });
    };

    return (
        <div id="bible-lookup-popup" className="shadow card">
            <div className="body card-body w-100">
                <h2>Bible key "{bibleKey}" is not available!</h2>
                Please change bible key here:{' '}
                <BibleSelectionMiniComp
                    bibleKey={bibleKey + '??'}
                    onBibleKeyChange={handleBibleKeyChanging}
                />
            </div>
        </div>
    );
}
