import {
    allArrows,
    KeyboardType, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import {
    processSelection,
    userEnteringSelected,
} from './selectionHelpers';
import {
    useFromLocaleNumBB, useToLocaleNumBB,
} from '../server/bible-helpers/bibleHelpers2';
import {
    useGetChapterCount,
} from '../server/bible-helpers/bibleHelpers';

const OPTION_CLASS = 'bible-search-chapter-option';
const OPTION_SELECTED_CLASS = 'active';

function genMatchedChapters(currentIndexing: number,
    chapterCount: number | null) {
    if (currentIndexing !== null && chapterCount !== null) {
        const chapterList = Array.from({
            length: chapterCount,
        }, (_, i) => {
            return i + 1;
        });
        return currentIndexing ? chapterList.filter((c) => {
            if (`${c}`.includes(`${currentIndexing}`)) {
                return true;
            }
            if (`${currentIndexing}`.includes(`${c}`)) {
                return true;
            }
            return false;
        }) : chapterList;
    }
    return null;
}

export default function RenderChapterOption({
    bookSelected,
    bibleSelected,
    inputText,
    onSelect,
}: {
    bibleSelected: string,
    bookSelected: string,
    inputText: string,
    onSelect: (chapter: number) => void,
}) {
    const chapterCount = useGetChapterCount(bibleSelected, bookSelected);
    const currentIndexing = useFromLocaleNumBB(bibleSelected,
        inputText.split(bookSelected)[1]);
    const matches = genMatchedChapters(currentIndexing || 0, chapterCount);

    const arrowListener = async (event: KeyboardEvent) => {
        processSelection(OPTION_CLASS, OPTION_SELECTED_CLASS,
            event.key as KeyboardType);
    };
    const useCallback = (k: KeyboardType) => {
        useKeyboardRegistering({
            key: k,
        }, arrowListener);
    };
    allArrows.forEach(useCallback);
    userEnteringSelected(OPTION_CLASS, OPTION_SELECTED_CLASS, (chapterStr) => {
        onSelect(Number(chapterStr));
    });
    return (
        <>
            {matches === null ? <div>
                No matched chapters
            </div> :
                matches.map((chapter) => {
                    const className = 'chapter-select btn btn-outline-success' +
                        ` ${OPTION_CLASS}`;
                    return (
                        <div key={chapter}
                            style={{ margin: '2px' }}>
                            <button className={className}
                                data-option-value={chapter}
                                type='button'
                                onClick={() => {
                                    onSelect(chapter);
                                }}>
                                <RendChapterAsync
                                    bibleSelected={bibleSelected}
                                    chapter={chapter} />
                            </button>
                        </div>
                    );
                })}
        </>
    );
}

function RendChapterAsync({ bibleSelected, chapter }: {
    bibleSelected: string, chapter: number,
}) {
    const n = useToLocaleNumBB(bibleSelected, chapter);
    if (n === null) {
        return null;
    }
    return `${n}` !== `${chapter}` ? (<>
        <span>{n}</span>
        (<small className='text-muted'>{chapter}</small>)
    </>) : (<span>{chapter}</span>);
}
