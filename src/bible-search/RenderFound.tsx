import './RenderFound.scss';

import { useEffect, useState } from 'react';
import {
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import {
    bookToKey, getVerses, VerseList,
} from '../server/bible-helpers/bibleHelpers1';
import RendLocalNumberAsync from './RendLocalNumberAsync';
import RenderFoundButtons from './RenderFoundButtons';

let mouseDownInd: number | null = null;
function mouseUp() {
    mouseDownInd = null;
}

export type ConsumeVerseType = {
    sVerse: number,
    eVerse: number,
    verses: VerseList,
};
export async function consumeStartVerseEndVerse(
    book: string,
    chapter: number,
    startVerse: number | null,
    endVerse: number | null,
    bibleSelected: string,
) {
    const bookKey = await bookToKey(bibleSelected, book);
    if (bookKey === null) {
        return null;
    }
    const verses = await getVerses(bibleSelected, bookKey, chapter);
    if (verses === null) {
        return null;
    }
    const verseCount = Object.keys(verses).length;
    const sVerse = startVerse !== null ? startVerse : 1;
    const eVerse = endVerse !== null ? endVerse : verseCount;
    const result: ConsumeVerseType = {
        verses,
        sVerse,
        eVerse,
    };
    return result;
}

export default function RenderFound({
    book,
    chapter,
    startVerse,
    endVerse,
    applyChapterSelection,
    onVerseChange,
    bibleSelected,
}: {
    book: string,
    chapter: number,
    startVerse: number | null,
    endVerse: number | null,
    applyChapterSelection: (chapter: number) => void,
    onVerseChange: (sv?: number, ev?: number) => void,
    bibleSelected: string,
}) {
    useKeyboardRegistering({
        key: 'Enter',
    }, () => {
        onVerseChange(sVerse, eVerse);
    });
    useKeyboardRegistering({
        key: 'Tab',
    }, (event: KeyboardEvent) => {
        event.stopPropagation();
        event.preventDefault();
        if (startVerse === null && endVerse === null) {
            applyChapterSelection(chapter);
        } else {
            onVerseChange(startVerse !== null ?
                startVerse : endVerse as number);
        }
    });
    useEffect(() => {
        document.body.addEventListener('mouseup', mouseUp);
        return () => {
            document.body.removeEventListener('mouseup', mouseUp);
        };
    });
    const [found, setFound] = useState<ConsumeVerseType | null>(null);
    useEffect(() => {
        consumeStartVerseEndVerse(book, chapter, startVerse,
            endVerse, bibleSelected).then((newFound) => {
                setFound(newFound);
            });
    }, [book, chapter, startVerse, endVerse, bibleSelected]);
    if (found === null) {
        return (
            <div>Not Found</div>
        );
    }
    const sVerse = found.sVerse;
    const eVerse = found.eVerse;
    const verseCount = Object.values(found.verses).length;
    return (
        <div className='render-found card border-success mb-3 mx-auto mt-5'>
            <div className='card-body'>
                <div className='verse-select d-flex align-content-start flex-wrap'>
                    {Array.from({ length: verseCount }, (_, i) => {
                        const ind = i + 1;
                        const started = sVerse === ind;
                        const inside = sVerse <= ind && ind <= eVerse;
                        const ended = eVerse === ind;
                        let select = `${started ? 'selected-start' : ''}`;
                        select += ` ${inside ? 'selected' : ''}`;
                        select += ` ${ended ? 'selected-end' : ''}`;
                        return (
                            <div key={`${ind}`}
                                onMouseDown={(event) => {
                                    if (event.shiftKey) {
                                        const arr = [ind, sVerse, eVerse]
                                            .sort((a, b) => {
                                                return a - b;
                                            });
                                        onVerseChange(arr.shift(), arr.pop());
                                    } else {
                                        onVerseChange(ind);
                                        mouseDownInd = ind;
                                    }
                                }}
                                onMouseEnter={() => {
                                    if (mouseDownInd !== null) {
                                        onVerseChange(Math.min(mouseDownInd, ind),
                                            Math.max(mouseDownInd, ind));
                                    }
                                }}
                                className={`item alert alert-secondary text-center ${select}`}>
                                <RendLocalNumberAsync ind={ind}
                                    bibleSelected={bibleSelected} />
                            </div>
                        );
                    })}
                </div>
            </div>
            <RenderFoundButtons found={found}
                book={book} chapter={chapter}
                bibleSelected={bibleSelected} />
        </div>
    );
}
