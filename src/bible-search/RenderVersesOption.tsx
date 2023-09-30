import './RenderVersesOption.scss';

import { useState } from 'react';
import {
    ConsumeVerseType, consumeStartVerseEndVerse,
} from '../bible-list/bibleHelpers';
import RenderVerseNumOption, {
    mouseUp,
} from './RenderVerseNumOption';
import { useAppEffect } from '../helper/debuggerHelpers';
import BibleItem from '../bible-list/BibleItem';

export default function RenderVersesOption({
    bibleItem, onVersesChange,
}: {
    bibleItem: BibleItem,
    onVersesChange: (startVerse?: number, endVerse?: number) => void,
}) {
    useAppEffect(() => {
        document.body.addEventListener('mouseup', mouseUp);
        return () => {
            document.body.removeEventListener('mouseup', mouseUp);
        };
    });
    const [found, setFound] = useState<ConsumeVerseType | null>(null);
    useAppEffect(() => {
        const {
            book: bookKey, chapter, startVerse, endVerse,
        } = bibleItem.target;
        consumeStartVerseEndVerse({
            chapter, startVerse, endVerse, bibleSelected: bibleItem.bibleKey,
            bookKey,
        }).then((newFound) => {
            setFound(newFound);
        });
    }, [bibleItem]);
    if (found === null) {
        return (
            <div>Not Found</div>
        );
    }
    const verseCount = Object.values(found.verses).length;
    return (
        <div className='render-found sticky-top'>
            <div className={'verse-select d-flex p-1 '
                + 'align-content-start flex-wrap'}>
                {Array.from({ length: verseCount }, (_, i) => {
                    return (
                        <RenderVerseNumOption key={i}
                            index={i}
                            onVerseChange={onVersesChange}
                            bibleSelected={bibleItem.bibleKey}
                            found={found} />
                    );
                })}
            </div>
        </div>
    );
}
