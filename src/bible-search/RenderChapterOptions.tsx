import {
    allArrows, KeyboardType, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import {
    processSelection, userEnteringSelected,
} from './selectionHelpers';
import {
    useChapterMatch,
} from '../helper/bible-helpers/serverBibleHelpers';

const OPTION_CLASS = 'bible-search-chapter-option';
const OPTION_SELECTED_CLASS = 'active';

export default function RenderChapterOptions({
    bibleKey, bookKey, chapter, guessingChapter, onSelect,
}: {
    bibleKey: string,
    bookKey: string | null,
    chapter: number | null,
    guessingChapter: string | null,
    onSelect: (chapter: number) => void,
}) {
    if (bookKey == null || chapter !== null) {
        return null;
    }
    return (
        <ChapterOptions
            bibleKey={bibleKey}
            bookKey={bookKey}
            guessingChapter={guessingChapter}
            onSelect={onSelect} />
    );
}

function ChapterOptions({
    bibleKey, bookKey, guessingChapter, onSelect,
}: {
    bibleKey: string,
    bookKey: string,
    guessingChapter: string | null,
    onSelect: (chapter: number) => void,
}) {
    const matches = useChapterMatch(bibleKey, bookKey, guessingChapter);
    const arrowListener = (event: KeyboardEvent) => {
        processSelection(
            OPTION_CLASS, OPTION_SELECTED_CLASS, event.key as KeyboardType,
        );
    };
    const useCallback = (key: KeyboardType) => {
        useKeyboardRegistering([{ key }], arrowListener);
    };
    allArrows.forEach(useCallback);
    userEnteringSelected(OPTION_CLASS, OPTION_SELECTED_CLASS, (chapterStr) => {
        onSelect(Number(chapterStr));
    });
    if (matches === null) {
        return (
            <div>
                No chapter options available
            </div>
        );
    }
    return (
        <>
            {matches.map(([chapter, chapterNumStr], i) => {
                const className = 'chapter-select btn btn-outline-success' +
                    ` ${OPTION_CLASS}` +
                    ` ${i === 0 ? OPTION_SELECTED_CLASS : ''}`;
                const isDiff = `${chapter}` !== chapterNumStr;
                return (
                    <div key={chapter}
                        title={isDiff ? `Chapter ${chapter}` : undefined}
                        style={{ margin: '2px' }}>
                        <button className={className}
                            data-option-value={chapter}
                            type='button'
                            onClick={() => {
                                onSelect(chapter);
                            }}>
                            <span>{chapterNumStr}</span>
                        </button>
                    </div>
                );
            })}
        </>
    );
}
