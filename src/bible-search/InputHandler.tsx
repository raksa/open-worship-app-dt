import bibleHelper from '../bible-helper/bibleHelper';
import { getBookKVList } from '../bible-helper/helpers';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { setSetting } from '../helper/settings';
import { toInputText } from './bibleSearchHelpers';

export function BibleSelectOption({ b }: { b: string }) {
    const [bible, isAvailable, bibleName] = bibleHelper.getBibleWithStatus(b);
    return (
        <option disabled={!isAvailable}
            value={bible}>{bibleName}</option>
    );
}

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
    const books = getBookKVList(bibleSelected);
    const bookKey = books === null ? null : books['GEN'];
    const placeholder = toInputText(bibleSelected, bookKey, 1, 1);

    useKeyboardRegistering({ key: KeyEnum.Escape }, () => onInputChange(''));

    const bibleList = bibleHelper.getBibleList();
    return (
        <>
            <input type="text" className="form-control" value={inputText}
                autoFocus placeholder={placeholder} onChange={(event) => {
                    const value = event.target.value;
                    onInputChange(value);
                }} />
            <span className="input-group-text select">
                <i className="bi bi-journal-bookmark"></i>
                <select className="form-select bible" value={bibleSelected}
                    onChange={(event) => {
                        const value = event.target.value;
                        setSetting('selected-bible', value);
                        onBibleChange(bibleSelected);
                    }}>
                    {bibleList.map((b, i) => <BibleSelectOption key={`${i}`} b={b} />)}
                </select>
            </span>
        </>
    );
}
