import {
    useGetBookKVList,
} from '../server/bible-helpers/bibleHelpers';
import { useBibleItemToInputText } from '../bible-list/BibleItem';
import {
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { setSetting } from '../helper/settingHelper';
import BibleSelection from './BibleSelection';
import { useCallback } from 'react';

export default function InputHandler({
    inputText,
    onInputChange,
    onBibleChange,
    bibleSelected,
}: {
    inputText: string
    onInputChange: (str: string) => void
    onBibleChange: (preBible: string) => void,
    bibleSelected: string;
}) {
    const onChangeHandler = useCallback((bibleKey: string) => {
        setSetting('selected-bible', bibleKey);
        onBibleChange(bibleKey);
    }, [onBibleChange]);
    const books = useGetBookKVList(bibleSelected);
    const bookKey = books === null ? null : books['GEN'];
    const placeholder = useBibleItemToInputText(
        bibleSelected, bookKey, 1, 1, 2);
    useKeyboardRegistering({ key: 'Escape' }, () => {
        onInputChange('');
    });
    return (
        <>
            <input type='text'
                className='form-control'
                value={inputText}
                autoFocus
                placeholder={placeholder}
                onChange={(event) => {
                    const value = event.target.value;
                    onInputChange(value);
                }} />
            <span className='input-group-text select'>
                <i className='bi bi-journal-bookmark' />
                <BibleSelection value={bibleSelected}
                    onChange={onChangeHandler} />
            </span>
        </>
    );
}
