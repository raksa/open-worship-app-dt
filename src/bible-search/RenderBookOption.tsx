import { useState } from 'react';
import bibleHelper from '../bible-helper/bibleHelper';
import { getBookKVList } from '../bible-helper/helpers';
import { KeyEnum, useKeyboardRegistering } from '../event/KeyboardEventListener';
import { isVisible } from '../helper/helpers';
import { genInd } from './genInd';

const genMatches = (bible: string, inputText: string) => {
    const kjvKeyValue = bibleHelper.getKJVKeyValue();
    const bookKVList = getBookKVList(bible);
    if (bookKVList === null) {
        return null;
    }
    const check = (v1: string, v2: string) => {
        if (~v1.toLowerCase().indexOf(v2.toLowerCase())) {
            return true;
        }
    };
    const keys = Object.keys(bookKVList);
    const matches = keys.filter((k) => {
        const kjvV = kjvKeyValue[k];
        const v = bookKVList[k];
        if (check(kjvV, inputText) || check(inputText, kjvV) ||
            check(k, inputText) || check(inputText, k) ||
            check(v, inputText) || check(inputText, v)) {
            return true;
        }
        return false;
    });
    return matches;
};

export default function RenderBookOption({
    inputText,
    onSelect,
    bibleSelected,
}: {
    inputText: string,
    onSelect: (book: string) => void,
    bibleSelected: string,
}) {
    const kjvKeyValue = bibleHelper.getKJVKeyValue();
    const bookKVList = getBookKVList(bibleSelected);
    const [attemptMatchIndex, setAttemptMatchIndex] = useState(0);
    const matches = genMatches(bibleSelected, inputText);

    const useCallback = (key: KeyEnum) => {
        useKeyboardRegistering({ key }, (e: KeyboardEvent) => {
            if (matches !== null && matches.length) {
                const ind = genInd(attemptMatchIndex, matches.length, e.key as KeyEnum, 2);
                setAttemptMatchIndex(ind);
            }
        });
    };
    const arrows = [KeyEnum.ArrowUp, KeyEnum.ArrowRight, KeyEnum.ArrowDown, KeyEnum.ArrowLeft];
    arrows.forEach(useCallback);
    useKeyboardRegistering({ key: KeyEnum.Enter }, () => {
        if (matches !== null && bookKVList !== null && matches[attemptMatchIndex]) {
            const k = matches[attemptMatchIndex];
            onSelect(bookKVList[k]);
        }
    });
    let applyAttemptIndex = attemptMatchIndex;
    if (matches !== null && matches.length && attemptMatchIndex >= matches.length) {
        applyAttemptIndex = 0;
    }
    return <>
        <span className="input-group-text float-start">
            <i className="bi bi-bookmark"></i>
        </span>
        <div className="row w-75 align-items-start g-2">
            {(matches === null || bookKVList == null) ?
                <div>No matched found</div> :
                matches.map((k, i) => {
                    const highlight = i === applyAttemptIndex;
                    return (
                        <div key={`${i}`} className="col-6">
                            <button ref={(self) => {
                                if (self && highlight && !isVisible(self)) {
                                    self.scrollIntoView({ block: 'end', behavior: 'smooth' });
                                }
                            }} type="button" onClick={() => {
                                onSelect(bookKVList[k]);
                            }} style={{ width: '240px', overflowX: 'auto' }}
                                className={`text-nowrap btn-sm btn btn-outline-success ${highlight ? 'active' : ''}`}>
                                <span>{bookKVList[k]}</span>
                                {bookKVList[k] !== kjvKeyValue[k] &&
                                    <>(<small className="text-muted">{kjvKeyValue[k]}</small>)</>}
                            </button>
                        </div>
                    );
                })}
        </div>
    </>;
}
