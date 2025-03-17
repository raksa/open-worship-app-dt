import { Fragment } from 'react';

import { useBookMatch } from '../helper/bible-helpers/serverBibleHelpers';
import {
    allArrows,
    KeyboardType,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import {
    SelectBookType,
    processSelection,
    userEnteringSelected,
} from './selectionHelpers';
import { useBibleKeyContext } from '../bible-list/bibleHelpers';

const OPTION_CLASS = 'bible-lookup-book-option';
const OPTION_SELECTED_CLASS = 'active';

function genBookOption({
    onSelect,
    index,
    bookKey,
    book,
    bookKJV,
    isAvailable,
}: {
    onSelect: SelectBookType;
    index: number;
    bookKey: string;
    book: string;
    bookKJV: string;
    isAvailable: boolean;
}) {
    const activeClass = index === 0 && isAvailable ? OPTION_SELECTED_CLASS : '';
    return (
        <div
            style={{ margin: '2px' }}
            title={isAvailable ? undefined : 'Not available'}
        >
            <button
                className={
                    'text-nowrap btn-sm btn btn-outline-success' +
                    ` ${OPTION_CLASS} ${activeClass}`
                }
                disabled={!isAvailable}
                style={{
                    width: '240px',
                    overflowX: 'auto',
                }}
                type="button"
                onClick={() => {
                    onSelect(bookKey, book);
                }}
            >
                <span>{book}</span>
                {book !== bookKJV ? (
                    <>
                        (<small className="text-muted">{bookKJV}</small>)
                    </>
                ) : null}
            </button>
        </div>
    );
}

function BookOptionsComp({
    onSelect,
    guessingBook,
}: Readonly<{
    onSelect: SelectBookType;
    guessingBook: string;
}>) {
    const bibleKey = useBibleKeyContext();
    const matches = useBookMatch(bibleKey, guessingBook);
    const useKeyEvent = (key: KeyboardType) => {
        useKeyboardRegistering(
            [{ key }],
            (event: KeyboardEvent) => {
                processSelection(
                    OPTION_CLASS,
                    OPTION_SELECTED_CLASS,
                    event.key as KeyboardType,
                );
            },
            [],
        );
    };
    allArrows.forEach(useKeyEvent);
    userEnteringSelected(OPTION_CLASS, OPTION_SELECTED_CLASS);

    if (matches === null) {
        return <div>No book options available</div>;
    }
    return (
        <>
            {matches.map(({ bookKey, book, bookKJV, isAvailable }, i) => {
                return (
                    <Fragment key={bookKey}>
                        {genBookOption({
                            bookKey,
                            book,
                            bookKJV,
                            onSelect,
                            index: i,
                            isAvailable,
                        })}
                    </Fragment>
                );
            })}
        </>
    );
}

export default function RenderBookOptionsComp({
    onSelect,
    bookKey,
    guessingBook,
}: Readonly<{
    onSelect: SelectBookType;
    bookKey: string | null;
    guessingBook: string | null;
}>) {
    if (bookKey !== null) {
        return null;
    }

    return (
        <BookOptionsComp
            onSelect={onSelect}
            guessingBook={guessingBook ?? ''}
        />
    );
}
