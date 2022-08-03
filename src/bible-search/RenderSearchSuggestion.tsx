import RenderBookOption from './RenderBookOption';
import RenderChapterOption from './RenderChapterOption';
import Header from './Header';
import RenderFound from './RenderFound';
import { ExtractedBibleResult } from '../server/bible-helpers/helpers2';
import Preview from './Preview';

export default function RenderSearchSuggestion({
    bibleResult, inputText, bibleSelected,
    applyChapterSelection,
    applyVerseSelection,
    applyBookSelection,
}: {
    inputText: string, bibleSelected: string,
    bibleResult: ExtractedBibleResult,
    applyChapterSelection: (newChapter: number) => void;
    applyVerseSelection: (newStartVerse?: number, newEndVerse?: number) => void;
    applyBookSelection: (newBook: string) => void;
}) {
    const {
        book, chapter,
        startVerse, endVerse,
    } = bibleResult;

    return (
        <div className='found'>
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
            {book && chapter !== null && <RenderFound
                bibleSelected={bibleSelected}
                book={book}
                chapter={chapter}
                startVerse={startVerse}
                endVerse={endVerse}
                applyChapterSelection={applyChapterSelection}
                onVerseChange={(newStartVerse, newEndVerse) => {
                    applyVerseSelection(newStartVerse, newEndVerse);
                }}
            />}
            {book && chapter !== null && <Preview
                bibleSelected={bibleSelected}
                book={book}
                chapter={chapter}
                startVerse={startVerse}
                endVerse={endVerse}
            />}
        </div>
    );
}

export function BibleNotAvailable() {
    return (
        <div id='bible-search-popup' className='app-modal shadow card'>
            <Header />
            <div className='body card-body w-100'>
                Bible not available!
            </div>
        </div>
    );
}
