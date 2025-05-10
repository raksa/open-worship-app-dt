import './RenderVersesOptionComp.scss';

import RenderVerseNumOptionComp, { mouseUp } from './RenderVerseNumOptionComp';
import { useAppEffect } from '../helper/debuggerHelpers';
import { useGenVerseList } from '../helper/bible-helpers/serverBibleHelpers';
import { useBibleItemContext } from '../bible-reader/BibleItemContext';

export default function RenderVerseOptionsComp({
    onVersesChange,
}: Readonly<{
    onVersesChange: (verseStart?: number, verseEnd?: number) => void;
}>) {
    const bibleItem = useBibleItemContext();
    const verseList = useGenVerseList(bibleItem);
    useAppEffect(() => {
        document.body.addEventListener('mouseup', mouseUp);
        return () => {
            document.body.removeEventListener('mouseup', mouseUp);
        };
    }, []);
    if (verseList === null) {
        return null;
    }
    return (
        <div className="render-found" data-bible-key={bibleItem.bibleKey}>
            <div
                className={
                    'verse-select d-flex p-1 align-content-start flex-wrap'
                }
            >
                {verseList.map(([verseNum, verseNumStr], i) => {
                    return (
                        <RenderVerseNumOptionComp
                            key={verseNumStr}
                            index={i}
                            verseNum={verseNum}
                            verseNumText={verseNumStr}
                            onVerseChange={onVersesChange}
                        />
                    );
                })}
                <span
                    className="p-2 pointer"
                    title="Full Verse"
                    onClick={() => {
                        onVersesChange(1, verseList.length);
                    }}
                >
                    <i className="bi bi-asterisk" />
                </span>
            </div>
        </div>
    );
}
