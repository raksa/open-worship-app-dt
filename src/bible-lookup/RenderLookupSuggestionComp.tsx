import RenderBookOptionsComp from './RenderBookOptionsComp';
import RenderChapterOptionsComp from './RenderChapterOptionsComp';
import { ExtractedBibleResult } from '../helper/bible-helpers/serverBibleHelpers2';
import RenderBibleDataFoundComp from './RenderBibleDataFoundComp';
import { BibleItemContext } from '../bible-reader/BibleItemContext';
import { attemptAddingHistory } from './InputHistoryComp';
import { BibleSelectionMiniComp } from './BibleSelectionComp';
import { LookupBibleItemViewController } from '../bible-reader/BibleItemViewController';
import { RENDER_FOUND_CLASS } from './selectionHelpers';

export default function RenderLookupSuggestionComp({
    bibleResult,
    applyChapterSelection,
    applyVerseSelection,
    applyBookSelection,
}: Readonly<{
    bibleResult: ExtractedBibleResult;
    applyChapterSelection: (newChapter: number) => void;
    applyVerseSelection: (newVerseStart?: number, newVerseEnd?: number) => void;
    applyBookSelection: (newBookKey: string, newBook: string) => void;
}>) {
    const handleVerseChanging = (
        newVerseStart?: number,
        newVerseEnd?: number,
    ) => {
        applyVerseSelection(newVerseStart, newVerseEnd);
    };
    const { bookKey, guessingBook, chapter, guessingChapter, bibleItem } =
        bibleResult;

    if (bibleItem !== null) {
        bibleItem.toTitle().then((text) => {
            attemptAddingHistory(bibleItem.bibleKey, text);
        });
        return (
            <BibleItemContext value={bibleItem}>
                <RenderBibleDataFoundComp onVerseChange={handleVerseChanging} />
            </BibleItemContext>
        );
    }
    return (
        <div
            className={`found w-100 h-100 app-focusable ${RENDER_FOUND_CLASS}`}
            style={{ overflowY: 'auto' }}
            tabIndex={0}
            onClick={(event) => {
                console.log('clicking on found');
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
    const viewController = LookupBibleItemViewController.getInstance();
    const handleBibleKeyChanging = (
        _oldBibleKey: string,
        newBibleKey: string,
    ) => {
        viewController.setBibleKey(newBibleKey);
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
