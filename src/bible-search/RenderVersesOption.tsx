import './RenderVersesOption.scss';

import { useState } from 'react';
import { genVerseList } from '../bible-list/bibleHelpers';
import RenderVerseNumOption, { mouseUp } from './RenderVerseNumOption';
import { useAppEffect } from '../helper/debuggerHelpers';
import BibleItem from '../bible-list/BibleItem';

export default function RenderVersesOption({
    bibleItem, onVersesChange,
}: {
    bibleItem: BibleItem,
    onVersesChange: (startVerse?: number, endVerse?: number) => void,
}) {
    const [verseList, setVerseList] = useState<string[] | null>(null);
    useAppEffect(() => {
        document.body.addEventListener('mouseup', mouseUp);
        return () => {
            document.body.removeEventListener('mouseup', mouseUp);
        };
    });
    const { bibleKey, target } = bibleItem;
    const { bookKey, chapter } = target;
    useAppEffect(() => {
        genVerseList({
            bibleKey, bookKey, chapter,
        }).then((verseNumList) => {
            setVerseList(verseNumList);
        });
    }, [bibleKey, bookKey, chapter]);

    if (verseList === null) {
        return null;
    }
    return (
        <div className='render-found sticky-top'>
            <div className={
                'verse-select d-flex p-1 align-content-start flex-wrap'
            }>
                {verseList.map((verseNumStr, i) => {
                    if (verseNumStr !== `${i + 1}`) {
                        verseNumStr = `${verseNumStr}(${i + 1})`;
                    }
                    return (
                        <RenderVerseNumOption
                            key={verseNumStr}
                            index={i}
                            verseNumText={verseNumStr}
                            onVerseChange={onVersesChange}
                            bibleItem={bibleItem} />
                    );
                })}
            </div>
        </div>
    );
}
