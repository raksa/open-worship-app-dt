import './RenderFound.scss';

import { useState } from 'react';
import {
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import RenderFoundButtons from './RenderFoundButtons';
import {
    ConsumeVerseType,
    consumeStartVerseEndVerse,
} from './bibleHelpers';
import RenderVerseNumOption, {
    mouseUp,
} from './RenderVerseNumOption';
import { useAppEffect } from '../helper/debuggerHelpers';

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
    onVerseChange: (startVerse?: number, endVerse?: number) => void,
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
    useAppEffect(() => {
        document.body.addEventListener('mouseup', mouseUp);
        return () => {
            document.body.removeEventListener('mouseup', mouseUp);
        };
    });
    const [found, setFound] = useState<ConsumeVerseType | null>(null);
    useAppEffect(() => {
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
        <div className='render-found card border-success'>
            <div className='card-body'>
                <div className={'verse-select d-flex '
                    + 'align-content-start flex-wrap'}>
                    {Array.from({ length: verseCount }, (_, i) => {
                        return (
                            <RenderVerseNumOption key={i}
                                index={i}
                                onVerseChange={onVerseChange}
                                bibleSelected={bibleSelected}
                                found={found} />
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
