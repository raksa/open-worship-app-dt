import { Fragment, useContext } from 'react';

import {
    useBookMatch,
} from '../helper/bible-helpers/serverBibleHelpers';
import {
    allArrows, KeyboardType, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import {
    SelectBookType,
    processSelection, userEnteringSelected,
} from './selectionHelpers';
import { SelectedBibleKeyContext } from '../bible-list/bibleHelpers';

const OPTION_CLASS = 'bible-search-book-option';
const OPTION_SELECTED_CLASS = 'active';

export default function RenderBookOptions({
    onSelect, bookKey, guessingBook,
}: Readonly<{
    onSelect: SelectBookType,
    bookKey: string | null,
    guessingBook: string | null,
}>) {
    if (bookKey !== null) {
        return null;
    }

    return (
        <BookOptions
            onSelect={onSelect}
            guessingBook={guessingBook ?? ''}
        />
    );
}

function BookOptions({
    onSelect, guessingBook,
}: Readonly<{
    onSelect: SelectBookType,
    guessingBook: string,
}>) {
    const bibleKey = useContext(SelectedBibleKeyContext);
    const matches = useBookMatch(bibleKey, guessingBook);
    const useKeyEvent = (key: KeyboardType) => {
        useKeyboardRegistering([{ key }], (event: KeyboardEvent) => {
            processSelection(
                OPTION_CLASS, OPTION_SELECTED_CLASS, event.key as KeyboardType,
            );
        });
    };
    allArrows.forEach(useKeyEvent);
    userEnteringSelected(OPTION_CLASS, OPTION_SELECTED_CLASS);

    if (matches === null) {
        return (
            <div>No book options available</div>
        );
    }
    return (
        <>
            {matches.map(([bookKey, book, bookKJV], i) => {
                return (
                    <Fragment key={bookKey}>
                        {genBookOption({
                            bookKey, book, bookKJV, onSelect, index: i,
                        })}
                    </Fragment>
                );
            })}
        </>
    );
}

function genBookOption({
    onSelect, index, bookKey, book, bookKJV,
}: {
    onSelect: SelectBookType,
    index: number,
    bookKey: string,
    book: string,
    bookKJV: string,
}) {
    return (
        <div style={{ margin: '2px' }}>
            <button className={
                'text-nowrap btn-sm btn btn-outline-success' +
                ` ${OPTION_CLASS} ${index === 0 ? OPTION_SELECTED_CLASS : ''}`
            }
                style={{
                    width: '240px',
                    overflowX: 'auto',
                }}
                type='button'
                onClick={() => {
                    onSelect(bookKey, book);
                }}>
                <span>{book}</span>
                {book !== bookKey ? <>
                    (<small className='text-muted'>
                        {bookKJV}
                    </small>)
                </> : null}
            </button>
        </div>
    );
}
