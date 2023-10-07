import { useCallback } from 'react';
import RenderBookOptions from './RenderBookOptions';
import RenderChapterOptions from './RenderChapterOptions';
import {
    ExtractedBibleResult,
} from '../helper/bible-helpers/serverBibleHelpers2';
import RenderBibleDataFound from './RenderBibleDataFound';

export default function RenderSearchSuggestion({
    applyChapterSelection, applyVerseSelection, applyBookSelection,
    bibleResult, bibleKey,
}: {
    applyChapterSelection: (newChapter: number) => void,
    applyVerseSelection: (
        newStartVerse?: number, newEndVerse?: number,
    ) => void,
    applyBookSelection: (newBook: string) => void,
    inputText: string,
    bibleKey: string,
    bibleResult: ExtractedBibleResult,
}) {
    const onVerseChangeCallback = useCallback(
        (newStartVerse?: number, newEndVerse?: number) => {
            applyVerseSelection(newStartVerse, newEndVerse);
        },
        [applyVerseSelection],
    );
    const {
        bookKey, guessingBook, chapter, guessingChapter, bibleItem,
    } = bibleResult;

    if (bibleItem !== null) {
        return (
            <div className='d-flex flex-column w-100 h-100 overflow-hidden'>
                <RenderBibleDataFound
                    bibleItem={bibleItem}
                    applyChapterSelection={applyChapterSelection}
                    onVerseChange={onVerseChangeCallback}
                />
            </div>
        );
    }

    return (
        <div className='w-100 h-100'
            style={{ overflow: 'auto' }}>
            <div className='d-flex flex-wrap justify-content-start'>
                <RenderBookOptions
                    bibleKey={bibleKey}
                    bookKey={bookKey}
                    guessingBook={guessingBook}
                    onSelect={applyBookSelection}
                />
                <RenderChapterOptions
                    bibleKey={bibleKey}
                    bookKey={bookKey}
                    chapter={chapter}
                    guessingChapter={guessingChapter}
                    onSelect={applyChapterSelection}
                />
            </div>
        </div>
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
