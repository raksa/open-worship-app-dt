import BibleItem from '../bible-list/BibleItem';

let mouseDownInd: number | null = null;
export function mouseUp() {
    mouseDownInd = null;
}

export default function RenderVerseNumOption({
    index, verseNum, verseNumText, bibleItem, onVerseChange,
}: {
    index: number,
    verseNum: number,
    verseNumText: string,
    bibleItem: BibleItem,
    onVerseChange: (startVerse?: number, endVerse?: number) => void,
}) {
    const { target } = bibleItem;
    const sVerse = target.startVerse;
    const eVerse = target.endVerse;
    const ind = index + 1;
    const started = sVerse === ind;
    const inside = sVerse <= ind && ind <= eVerse;
    const ended = eVerse === ind;
    let select = `${started ? 'selected-start' : ''}`;
    select += ` ${inside ? 'selected' : ''}`;
    select += ` ${ended ? 'selected-end' : ''}`;
    return (
        <div className={`item alert pointer text-center ${select}`}
            title={
                `${verseNum}` !== verseNumText ? `Verse ${verseNum}` : undefined
            }
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
            }}>
            <span>{verseNumText}</span>
        </div>
    );
}
