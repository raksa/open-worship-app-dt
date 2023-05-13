import { ConsumeVerseType } from '../helper/bibleHelpers';
import RendLocalNumberAsync from './RendLocalNumberAsync';

let mouseDownInd: number | null = null;
export function mouseUp() {
    mouseDownInd = null;
}

export default function RenderVerseNumOption({
    index, bibleSelected, onVerseChange, found,
}: {
    index: number,
    onVerseChange: (sv?: number, ev?: number) => void,
    bibleSelected: string,
    found: ConsumeVerseType,
}) {
    const sVerse = found.sVerse;
    const eVerse = found.eVerse;
    const ind = index + 1;
    const started = sVerse === ind;
    const inside = sVerse <= ind && ind <= eVerse;
    const ended = eVerse === ind;
    let select = `${started ? 'selected-start' : ''}`;
    select += ` ${inside ? 'selected' : ''}`;
    select += ` ${ended ? 'selected-end' : ''}`;
    return (
        <div className={`item alert pointer text-center ${select}`}
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
            <RendLocalNumberAsync ind={ind}
                bibleSelected={bibleSelected} />
        </div>
    );
}
