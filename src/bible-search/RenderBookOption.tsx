import { useState } from 'react';
import bibleHelper, {
    useGetBookKVList, useMatch,
} from '../server/bible-helpers/bibleHelpers';
import {
    allArrows,
    KeyboardType, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { isVisible } from '../helper/helpers';
import { genInd } from './genInd';

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
    const bookKVList = useGetBookKVList(bibleSelected);
    const [attemptMatchIndex, setAttemptMatchIndex] = useState(0);
    const matches = useMatch(bibleSelected, inputText);

    const useCallback = (key: KeyboardType) => {
        useKeyboardRegistering({ key }, (event: KeyboardEvent) => {
            if (matches !== null && matches.length) {
                const ind = genInd(attemptMatchIndex, matches.length,
                    event.key as KeyboardType, 2);
                setAttemptMatchIndex(ind);
            }
        });
    };
    allArrows.forEach(useCallback);
    useKeyboardRegistering({ key: 'Enter' }, () => {
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
        <span className='input-group-text float-start'>
            <i className='bi bi-bookmark' />
        </span>
        <div className='row w-75 align-items-start g-2'>
            {(matches === null || bookKVList === null) ?
                <div>No matched found</div> :
                matches.map((k, i) => {
                    const highlight = i === applyAttemptIndex;
                    return (
                        <div key={`${i}`} className='col-6'>
                            <button ref={(self) => {
                                if (self && highlight && !isVisible(self)) {
                                    self.scrollIntoView({ block: 'end', behavior: 'smooth' });
                                }
                            }} type='button' onClick={() => {
                                onSelect(bookKVList[k]);
                            }} style={{ width: '240px', overflowX: 'auto' }}
                                className={`text-nowrap btn-sm btn btn-outline-success ${highlight ? 'active' : ''}`}>
                                <span>{bookKVList[k]}</span>
                                {bookKVList[k] !== kjvKeyValue[k] &&
                                    <>(<small className='text-muted'>{kjvKeyValue[k]}</small>)</>}
                            </button>
                        </div>
                    );
                })}
        </div>
    </>;
}
