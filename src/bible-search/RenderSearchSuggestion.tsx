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
}: Readonly<{
    applyChapterSelection: (newChapter: number) => void,
    applyVerseSelection: (
        newVerseStart?: number, newVerseEnd?: number,
    ) => void,
    applyBookSelection: (newBookKey: string, newBook: string) => void,
    bibleKey: string,
    bibleResult: ExtractedBibleResult,
}>) {
    const onVerseChangeCallback = useCallback(
        (newVerseStart?: number, newVerseEnd?: number) => {
            applyVerseSelection(newVerseStart, newVerseEnd);
        },
        [applyVerseSelection],
    );
    const {
        bookKey, guessingBook, chapter, guessingChapter, bibleItem,
    } = bibleResult;

    if (bibleItem !== null) {
        return (
            <div className='d-flex w-100 h-100'>
                <RenderBibleDataFound
                    bibleItem={bibleItem}
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
