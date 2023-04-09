import { useState } from 'react';
import {
    getKJVKeyValue,
    useGetBookKVList, useMatch,
} from '../server/bible-helpers/bibleHelpers';
import {
    allArrows,
    KeyboardType, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { isVisible } from '../helper/helpers';
import { genInd } from './genInd';

const OPTION_CLASS = 'bible-search-book-option';

export default function RenderBookOption({
    inputText,
    onSelect,
    bibleSelected,
}: {
    inputText: string,
    onSelect: (book: string) => void,
    bibleSelected: string,
}) {
    const kjvKeyValue = getKJVKeyValue();
    const bookKVList = useGetBookKVList(bibleSelected);
    const [attemptMatchIndex, setAttemptMatchIndex] = useState(0);
    const matches = useMatch(bibleSelected, inputText);

    const useCallback = (key: KeyboardType) => {
        useKeyboardRegistering({ key }, (event: KeyboardEvent) => {
            if (matches !== null && matches.length) {
                const ind = genInd(attemptMatchIndex, matches.length,
                    event.key as KeyboardType, 2, OPTION_CLASS);
                setAttemptMatchIndex(ind);
            }
        });
    };
    allArrows.forEach(useCallback);
    useKeyboardRegistering({ key: 'Enter' }, () => {
        if (matches !== null && bookKVList !== null
            && matches[attemptMatchIndex]) {
            const k = matches[attemptMatchIndex];
            onSelect(bookKVList[k]);
        }
    });
    let applyAttemptIndex = attemptMatchIndex;
    if (matches !== null && matches.length
        && attemptMatchIndex >= matches.length) {
        applyAttemptIndex = 0;
    }
    return <>
        {(matches === null || bookKVList === null) ?
            <div>No matched found</div> :
            matches.map((key, i) => {
                return (
                    <RenderOption key={key}
                        index={i}
                        bibleKey={key}
                        bookKVList={bookKVList}
                        kjvKeyValue={kjvKeyValue}
                        onSelect={onSelect}
                        applyAttemptIndex={applyAttemptIndex}
                    />
                );
            })}
    </>;
}

function RenderOption({
    index, bibleKey, bookKVList, kjvKeyValue,
    onSelect, applyAttemptIndex,
}: {
    index: number,
    bibleKey: string,
    bookKVList: {
        [key: string]: string;
    } | null,
    kjvKeyValue: {
        [key: string]: string;
    },
    onSelect: (book: string) => void
    applyAttemptIndex: number,
}) {
    const highlight = index === applyAttemptIndex;
    if (bookKVList === null) {
        return <div>No matched found</div>;
    }
    return (
        <div className={OPTION_CLASS}
            style={{ margin: '2px' }}>
            <button style={{ width: '240px', overflowX: 'auto' }}
                ref={(self) => {
                    if (self && highlight && !isVisible(self)) {
                        self.scrollIntoView({
                            block: 'end',
                            behavior: 'smooth',
                        });
                    }
                }}
                type='button'
                onClick={() => {
                    onSelect(bookKVList[bibleKey]);
                }}
                className={'text-nowrap btn-sm btn btn-outline-success '
                    + `${highlight ? 'active' : ''}`}>
                <span>{bookKVList[bibleKey]}</span>
                {bookKVList[bibleKey] !== kjvKeyValue[bibleKey] &&
                    <>(<small className='text-muted'>
                        {kjvKeyValue[bibleKey]}
                    </small>)</>}
            </button>
        </div>
    );
}