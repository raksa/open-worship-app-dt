import {
    getKJVKeyValue,
    useGetBookKVList, useMatch,
} from '../server/bible-helpers/bibleHelpers';
import {
    allArrows,
    KeyboardType, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import {
    processSelection,
    userEnteringSelected,
} from './selectionHelpers';

const OPTION_CLASS = 'bible-search-book-option';
const OPTION_SELECTED_CLASS = 'active';

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
    const matches = useMatch(bibleSelected, inputText);

    const useCallback = (key: KeyboardType) => {
        useKeyboardRegistering({ key }, (event: KeyboardEvent) => {
            processSelection(OPTION_CLASS, OPTION_SELECTED_CLASS,
                event.key as KeyboardType);
        });
    };
    allArrows.forEach(useCallback);
    userEnteringSelected(OPTION_CLASS, OPTION_SELECTED_CLASS, onSelect);
    return <>
        {(matches === null || bookKVList === null) ?
            <div>No matched found</div> :
            matches.map((key, i) => {
                return (
                    <RenderOption key={key}
                        bibleKey={key}
                        bookKVList={bookKVList}
                        kjvKeyValue={kjvKeyValue}
                        onSelect={onSelect}
                        index={i}
                    />
                );
            })}
    </>;
}

function RenderOption({
    bibleKey, bookKVList, kjvKeyValue, onSelect, index,
}: {
    bibleKey: string,
    bookKVList: {
        [key: string]: string;
    } | null,
    kjvKeyValue: {
        [key: string]: string;
    },
    onSelect: (book: string) => void,
    index: number,
}) {
    if (bookKVList === null) {
        return <div>No matched found</div>;
    }
    const key = bookKVList[bibleKey];
    return (
        <div style={{ margin: '2px' }}>
            <button className={'text-nowrap btn-sm btn btn-outline-success' +
                ` ${OPTION_CLASS} ${index === 0 ? OPTION_SELECTED_CLASS : ''}`}
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
