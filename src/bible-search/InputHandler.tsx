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
import {
    SearchBibleItemViewController,
} from '../read-bible/BibleItemViewController';

export default function InputHandler({
    inputText, onBibleChange, bibleKey,
}: Readonly<{
    inputText: string
    onBibleChange: (oldBibleKey: string, newBibleKey: string) => void,
    bibleKey: string;
}>) {
    const setInputText = SearchBibleItemViewController.
        getInstance().setInputText;
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
            setInputText('');
            return;
        }
        arr.pop();
        setInputText(arr.join(' ') + (arr.length > 0 ? ' ' : ''));
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
                    setInputText(value);
                }} />
            <span className='input-group-text select'>
                <i className='bi bi-journal-bookmark' />
                <BibleSelection value={bibleKey}
                    onChange={onBibleChange} />
            </span>
        </>
    );
}
