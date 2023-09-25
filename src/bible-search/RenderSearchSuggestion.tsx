import { useCallback } from 'react';
import RenderBookOption from './RenderBookOption';
import RenderChapterOption from './RenderChapterOption';
import {
    ExtractedBibleResult,
} from '../helper/bible-helpers/serverBibleHelpers2';
import RenderBibleDataFound from './RenderBibleDataFound';

export default function RenderSearchSuggestion({
    bibleResult, inputText, bibleSelected,
    applyChapterSelection,
    applyVerseSelection,
    applyBookSelection,
}: {
    inputText: string, bibleSelected: string,
    bibleResult: ExtractedBibleResult,
    applyChapterSelection: (newChapter: number) => void,
    applyVerseSelection: (newStartVerse?: number,
        newEndVerse?: number) => void,
    applyBookSelection: (newBook: string) => void,
}) {
    const onVerseChangeCallback = useCallback((
        newStartVerse?: number, newEndVerse?: number) => {
        applyVerseSelection(newStartVerse, newEndVerse);
    }, [applyVerseSelection]);
    const {
        book, chapter,
        startVerse, endVerse,
    } = bibleResult;

    const isChoosing = !book || chapter === null;
    return (
        <>
            {isChoosing && <div className='w-100 h-100'
                style={{ overflow: 'auto' }}>
                <div className='d-flex flex-wrap justify-content-start'>
                    {!book && <RenderBookOption
                        bibleSelected={bibleSelected}
                        inputText={inputText}
                        onSelect={applyBookSelection}
                    />}
                    {book && chapter === null && <RenderChapterOption
                        bibleSelected={bibleSelected}
                        bookSelected={book}
                        inputText={inputText}
                        onSelect={applyChapterSelection}
                    />}
                </div>
            </div>}
            <div className='d-flex flex-column w-100 h-100 overflow-hidden'>
                {book && chapter !== null && <RenderBibleDataFound
                    bibleSelected={bibleSelected}
                    book={book}
                    chapter={chapter}
                    startVerse={startVerse}
                    endVerse={endVerse}
                    applyChapterSelection={applyChapterSelection}
                    onVerseChange={onVerseChangeCallback}
                />}
            </div>
        </>
    );
}


export function BibleNotAvailable() {
    return (
        <div id='bible-search-popup' className='app-modal shadow card'>
            <div className='body card-body w-100'>
                Bible not available!
            </div>
        </div>
    );
}
