import { useState } from 'react';
import { KeyEnum, useKeyboardRegistering } from '../event/KeyboardEventListener';
import { genInd } from './genInd';
import { fromLocaleNumber, toLocaleNumber } from './bibleSearchHelpers';
import { getChapterCount } from '../bible-helper/helpers';

export default function RenderChapterOption({
    bookSelected,
    bibleSelected,
    inputText,
    onSelect,
}: {
    bibleSelected: string,
    bookSelected: string,
    inputText: string,
    onSelect: (chapter: number) => void,
}) {
    const chapterCount = getChapterCount(bibleSelected, bookSelected);
    let matches: number[] | null = null;
    if (chapterCount !== null) {
        const chapterList = Array.from({ length: chapterCount }, (_, i) => i + 1);
        const currentIndexing = +fromLocaleNumber(bibleSelected, inputText.split(bookSelected)[1]);
        matches = currentIndexing ? chapterList.filter((c) => {
            if (~`${c}`.indexOf(`${currentIndexing}`)) {
                return true;
            }
            if (~`${currentIndexing}`.indexOf(`${c}`)) {
                return true;
            }
            return false;
        }) : chapterList;
    }

    const [attemptChapterIndex, setAttemptChapterIndex] = useState(0);
    const arrowListener = (e: KeyboardEvent) => {
        const newChapterCount = getChapterCount(bibleSelected, bookSelected);
        if (newChapterCount !== null) {
            const ind = genInd(attemptChapterIndex, newChapterCount, e.key as KeyEnum, 6);
            setAttemptChapterIndex(ind);
        }
    };
    const arrows = [KeyEnum.ArrowUp, KeyEnum.ArrowRight, KeyEnum.ArrowDown, KeyEnum.ArrowLeft];
    const useCallback = (k: KeyEnum) => {
        useKeyboardRegistering({
            key: k,
        }, arrowListener);
    };
    arrows.forEach(useCallback);
    const enterListener = () => {
        if (matches !== null) {
            const chapter = matches[attemptChapterIndex];
            if (chapter) {
                onSelect(chapter);
            }
        }
    };
    useKeyboardRegistering({
        key: KeyEnum.Enter,
    }, enterListener);
    let applyAttemptIndex = attemptChapterIndex;
    if (matches === null || attemptChapterIndex > matches.length - 1) {
        applyAttemptIndex = 0;
    }
    return <>
        <span className="input-group-text float-start">
            <i className="bi bi-box-arrow-in-right"></i>
        </span>
        <div className="row w-75 align-items-start g-2">
            {matches === null ? <div>not matched chapters</div> :
                matches.map((chapter, i) => {
                    const highlight = i === applyAttemptIndex;
                    const trueChapter = toLocaleNumber(bibleSelected, chapter);
                    const className = `chapter-select btn btn-outline-success ${highlight ? 'active' : ''}`;
                    return (
                        <div className="col-2" key={`${i}`}>
                            <button type="button" onClick={() => {
                                onSelect(chapter);
                            }} className={className}>
                                {`${trueChapter}` !== `${chapter}` ? <>
                                    <span>{trueChapter}</span>
                                    (<small className="text-muted">{chapter}</small>)
                                </> : <span>{chapter}</span>}
                            </button>
                        </div>
                    );
                })}
        </div>
    </>;
}
