import {
    useGetBookKVList,
} from '../helper/bible-helpers/serverBibleHelpers';
import {
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import BibleSelection from './BibleSelection';
import {
    INPUT_ID, INPUT_TEXT_CLASS, checkIsBibleSearchInputFocused,
    setBibleSearchInputFocus,
} from './selectionHelpers';
import {
    useBibleItemPropsToInputText,
} from '../bible-list/bibleItemHelpers';

export default function InputHandler({
    inputText, onInputChange, onBibleChange, bibleKey,
}: Readonly<{
    inputText: string
    onInputChange: (str: string) => void
    onBibleChange: (oldBibleKey: string, newBibleKey: string) => void,
    bibleKey: string;
}>) {
    const books = useGetBookKVList(bibleKey);
    const bookKey = books === null ? null : books['GEN'];
    const placeholder = useBibleItemPropsToInputText(
        bibleKey, bookKey, 1, 1, 2,
    );
    useKeyboardRegistering([{ key: 'Escape' }], () => {
        if (!checkIsBibleSearchInputFocused()) {
            setBibleSearchInputFocus();
            return;
        }
        const arr = inputText.split(' ').filter((str) => str !== '');
        if (arr.length === 1) {
            onInputChange('');
            return;
        }
        arr.pop();
        onInputChange(arr.join(' ') + (arr.length > 0 ? ' ' : ''));
    });
    return (
        <>
            <input id={INPUT_ID} type='text'
                className={`form-control ${INPUT_TEXT_CLASS}`}
                value={inputText}
                autoFocus
                placeholder={placeholder}
                onChange={(event) => {
                    const value = event.target.value;
                    onInputChange(value);
                }} />
            <span className='input-group-text select'>
                <i className='bi bi-journal-bookmark' />
                <BibleSelection value={bibleKey}
                    onChange={onBibleChange} />
            </span>
        </>
    );
}
