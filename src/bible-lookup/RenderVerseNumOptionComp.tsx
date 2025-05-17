import { useBibleItemContext } from '../bible-reader/BibleItemContext';

let mouseDownInd: number | null = null;
export function mouseUp() {
    mouseDownInd = null;
}

export default function RenderVerseNumOptionComp({
    index,
    verseNum,
    verseNumText,
    onVerseChange,
}: Readonly<{
    index: number;
    verseNum: number;
    verseNumText: string;
    onVerseChange: (verseStart: number, verseEnd?: number) => void;
}>) {
    const bibleItem = useBibleItemContext();
    const { target } = bibleItem;
    const sVerse = target.verseStart;
    const eVerse = target.verseEnd;
    const ind = index + 1;
    const started = sVerse === ind;
    const inside = sVerse <= ind && ind <= eVerse;
    const ended = eVerse === ind;
    let select = `${started ? 'selected-start' : ''}`;
    select += ` ${inside ? 'selected' : ''}`;
    select += ` ${ended ? 'selected-end' : ''}`;
    return (
        <div
            className={`item alert pointer text-center ${select}`}
            title={
                `${verseNum}` !== verseNumText ? `Verse ${verseNum}` : undefined
            }
            onMouseDown={(event) => {
                if (event.shiftKey) {
                    const arr = [ind, sVerse, eVerse].sort((a, b) => {
                        return a - b;
                    });
                    const verse = arr.shift();
                    if (verse === undefined) {
                        return;
                    }
                    onVerseChange(verse, arr.pop());
                } else {
                    onVerseChange(ind);
                    mouseDownInd = ind;
                }
            }}
            onMouseEnter={() => {
                if (mouseDownInd !== null) {
                    onVerseChange(
                        Math.min(mouseDownInd, ind),
                        Math.max(mouseDownInd, ind),
                    );
                }
            }}
        >
            <span>{verseNumText}</span>
        </div>
    );
}
