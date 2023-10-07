import { Fragment } from 'react';
import {
    getKJVKeyValue, useGetBookKVList, useBookMatch,
} from '../helper/bible-helpers/serverBibleHelpers';
import {
    allArrows, KeyboardType, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import {
    processSelection, userEnteringSelected,
} from './selectionHelpers';

const OPTION_CLASS = 'bible-search-book-option';
const OPTION_SELECTED_CLASS = 'active';

export default function RenderBookOptions({
    onSelect, bibleKey, bookKey, guessingBook,
}: {
    onSelect: (bookKey: string) => void,
    bibleKey: string,
    bookKey: string | null,
    guessingBook: string | null,
}) {

    if (bookKey !== null) {
        return null;
    }

    return (
        <BookOptions
            onSelect={onSelect}
            bibleKey={bibleKey}
            guessingBook={guessingBook ?? ''} />
    );
}

function BookOptions({
    onSelect, bibleKey, guessingBook,
}: {
    onSelect: (bookKey: string) => void,
    bibleKey: string,
    guessingBook: string,
}) {
    const bookKVList = useGetBookKVList(bibleKey);
    const matches = useBookMatch(bibleKey, guessingBook);
    const useKeyEvent = (key: KeyboardType) => {
        useKeyboardRegistering([{ key }], (event: KeyboardEvent) => {
            processSelection(
                OPTION_CLASS, OPTION_SELECTED_CLASS, event.key as KeyboardType,
            );
        });
    };
    allArrows.forEach(useKeyEvent);
    userEnteringSelected(OPTION_CLASS, OPTION_SELECTED_CLASS, onSelect);

    if (matches === null || bookKVList === null) {
        return (
            <div>No book options available</div>
        );
    }
    return (
        <>
            {matches.map((key, i) => {
                return (
                    <Fragment key={key}>
                        {genBookOption({
                            bibleKey: bibleKey,
                            bookKVList,
                            onSelect,
                            index: i,
                        })}
                    </Fragment>
                );
            })}
        </>
    );
}

function genBookOption({
    bibleKey, bookKVList, onSelect, index,
}: {
    bibleKey: string,
    bookKVList: { [key: string]: string } | null,
    onSelect: (bookKey: string) => void,
    index: number,
}) {
    if (bookKVList === null) {
        return (
            <div>No book option available</div>
        );
    }
    const kjvKeyValue = getKJVKeyValue();
    const key = bookKVList[bibleKey];
    return (
        <div style={{ margin: '2px' }}>
            <button className={
                'text-nowrap btn-sm btn btn-outline-success' +
                ` ${OPTION_CLASS} ${index === 0 ? OPTION_SELECTED_CLASS : ''}`
            }
                data-option-value={key}
                style={{
                    width: '240px',
                    overflowX: 'auto',
                }}
                type='button'
                onClick={() => {
                    onSelect(key);
                }}>
                <span>{key}</span>
                {key !== kjvKeyValue[bibleKey] && <>
                    (<small className='text-muted'>
                        {kjvKeyValue[bibleKey]}
                    </small>)
                </>}
            </button>
        </div>
    );
}
