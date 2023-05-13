import {
    useGetBookKVList,
} from '../helper/bible-helpers/serverBibleHelpers';
import {
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import BibleSelection from './BibleSelection';
import { useRef } from 'react';
import { INPUT_TEXT_CLASS } from './selectionHelpers';
import { 
    useBibleItemToInputText,
 } from '../helper/bible-helpers/bibleRenderHelpers';

export default function InputHandler({
    inputText,
    onInputChange,
    onBibleChange,
    bibleSelected,
}: {
    inputText: string
    onInputChange: (str: string) => void
    onBibleChange: (oldBibleKey: string, newBibleKey: string) => void,
    bibleSelected: string;
}) {
    const books = useGetBookKVList(bibleSelected);
    const bookKey = books === null ? null : books['GEN'];
    const placeholder = useBibleItemToInputText(
        bibleSelected, bookKey, 1, 1, 2);
    useKeyboardRegistering({ key: 'Escape' }, () => {
        if (inputRef.current !== null) {
            if (document.activeElement !== inputRef.current) {
                inputRef.current.focus();
                return;
            }
            onInputChange('');
        }
    });
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <>
            <input ref={inputRef} type='text'
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
                <BibleSelection value={bibleSelected}
                    onChange={onBibleChange} />
            </span>
        </>
    );
}
