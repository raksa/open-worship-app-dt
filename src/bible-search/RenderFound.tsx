import './RenderFound.scss';

import { useEffect, useState } from 'react';
import {
    keyboardEventListener,
    KeyEnum,
    LinuxControlEnum,
    MacControlEnum,
    useKeyboardRegistering,
    WindowsControlEnum,
} from '../event/KeyboardEventListener';
import { closeBibleSearch } from './BibleSearchPopup';
import { fromLocaleNumber, useToLocaleNumber } from '../bible-helper/helpers2';
import { addBibleItem } from '../bible-list/BibleList';
import { isWindowEditingMode } from '../App';
import { bookToKey, getVerses, VerseList } from '../bible-helper/helpers1';
import { toastEventListener } from '../event/ToastEventListener';
import { presentBible } from '../bible-list/BibleItem';

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
    const verses = await getVerses(bibleSelected, bookKey,
        await fromLocaleNumber(bibleSelected, chapter));
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
    onVerseChange: (startVerse?: number, endVerse?: number) => void,
    bibleSelected: string,
}) {
    const addListEventMapper = {
        wControlKey: [WindowsControlEnum.Ctrl],
        mControlKey: [MacControlEnum.Ctrl],
        lControlKey: [LinuxControlEnum.Ctrl],
        key: KeyEnum.Enter,
    };
    const genBiblePresent = async () => {
        const key = await bookToKey(bibleSelected, book);
        if (key === null) {
            return null;
        }
        return {
            bible: bibleSelected,
            target: {
                book: key,
                chapter: await fromLocaleNumber(bibleSelected, chapter),
                startVerse: await fromLocaleNumber(bibleSelected, sVerse),
                endVerse: await fromLocaleNumber(bibleSelected, eVerse),
            },
        };
    };
    const addListListener = async () => {
        const biblePresent = await genBiblePresent();
        if (biblePresent !== null) {
            await addBibleItem(biblePresent);
            closeBibleSearch();
        } else {
            toastEventListener.showSimpleToast({
                title: 'Adding bible',
                message: 'Fail to add bible to list',
            });
        }
    };
    const presentEventMapper = {
        wControlKey: [WindowsControlEnum.Ctrl, WindowsControlEnum.Shift],
        mControlKey: [MacControlEnum.Ctrl, MacControlEnum.Shift],
        lControlKey: [LinuxControlEnum.Ctrl, LinuxControlEnum.Shift],
        key: KeyEnum.Enter,
    };
    const presentListener = async () => {
        const biblePresent = await genBiblePresent();
        if (biblePresent !== null) {
            await addBibleItem(biblePresent);
            closeBibleSearch();
            presentBible(biblePresent);
        } else {
            toastEventListener.showSimpleToast({
                title: 'Adding bible',
                message: 'Fail to add bible to list',
            });
        }
    };
    useKeyboardRegistering(addListEventMapper, addListListener);
    useKeyboardRegistering(presentEventMapper, presentListener);
    useKeyboardRegistering({ key: KeyEnum.Enter }, () => {
        onVerseChange(sVerse, eVerse);
    });
    useKeyboardRegistering({ key: KeyEnum.Tab }, (e: KeyboardEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (startVerse === null && endVerse === null) {
            applyChapterSelection(chapter);
        } else {
            onVerseChange(startVerse !== null ? startVerse : endVerse as number);
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
        return (<div>Not Found</div>);
    }
    const sVerse = found.sVerse;
    const eVerse = found.eVerse;
    const verseCount = Object.values(found.verses).length;
    return (
        <div className="render-found card border-success mb-3 mx-auto mt-5">
            <div className="card-body">
                <div className="verse-select d-flex align-content-start flex-wrap">
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
                                onMouseDown={(e) => {
                                    if (e.shiftKey) {
                                        const arr = [ind, sVerse, eVerse].sort((a, b) => a - b);
                                        console.log(arr);
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
                                <RendLocalNumberAsync bibleSelected={bibleSelected} ind={ind} />
                            </div>
                        );
                    })}
                </div>
            </div>
            {!isWindowEditingMode() &&
                <div className="card-footer bg-transparent border-success d-flex justify-content-evenly">
                    <button type="button" className="tool-tip tool-tip-fade btn btn-sm btn-primary ms-5 me-5"
                        onClick={addListListener}
                        data-tool-tip={keyboardEventListener.toShortcutKey(addListEventMapper)}
                    >Add Bible List</button>
                    <button type="button" className="tool-tip tool-tip-fade btn btn-sm btn-primary ms-5 me-5"
                        onClick={presentListener}
                        data-tool-tip={keyboardEventListener.toShortcutKey(presentEventMapper)}
                    >Present</button>
                </div>
            }
        </div>
    );
}
function RendLocalNumberAsync({ bibleSelected, ind }: {
    bibleSelected: string, ind: number,
}) {
    const str = useToLocaleNumber(bibleSelected, ind);
    return (
        <span>{str || ''}</span>
    );
}
