import './RenderVersesOption.scss';

import RenderVerseNumOption, { mouseUp } from './RenderVerseNumOption';
import { useAppEffect } from '../helper/debuggerHelpers';
import BibleItem from '../bible-list/BibleItem';
import { useGenVerseList } from '../helper/bible-helpers/serverBibleHelpers';

export default function RenderVerseOptions({
    bibleItem, onVersesChange,
}: Readonly<{
    bibleItem: BibleItem,
    onVersesChange: (verseStart?: number, verseEnd?: number) => void,
}>) {
    const verseList = useGenVerseList(bibleItem);
    useAppEffect(() => {
        document.body.addEventListener('mouseup', mouseUp);
        return () => {
            document.body.removeEventListener('mouseup', mouseUp);
        };
    });
    if (verseList === null) {
        return null;
    }
    return (
        <div className='render-found'>
            <div className={
                'verse-select d-flex p-1 align-content-start flex-wrap'
            }>
                {verseList.map(([verseNum, verseNumStr], i) => {
                    return (
                        <RenderVerseNumOption
                            key={verseNumStr}
                            index={i}
                            verseNum={verseNum}
                            verseNumText={verseNumStr}
                            onVerseChange={onVersesChange}
                            bibleItem={bibleItem}
                        />
                    );
                })}
            </div>
        </div>
    );
}
