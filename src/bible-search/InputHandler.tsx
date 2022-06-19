import bibleHelper, {
    useGetBibleWithStatus,
    useGetBookKVList,
} from '../bible-helper/bibleHelpers';
import { usePresentToInputText } from '../bible-list/BibleItem';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { setSetting } from '../helper/settingHelper';

export function BibleSelectOption({ bibleName }: { bibleName: string }) {
    const bibleStatus = useGetBibleWithStatus(bibleName);
    if (bibleStatus === null) {
        return null;
    }
    const [bible1, isAvailable, bibleName1] = bibleStatus;
    return (
        <option disabled={!isAvailable}
            value={bible1}>{bibleName1}</option>
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
    const books = useGetBookKVList(bibleSelected);
    const bookKey = books === null ? null : books['GEN'];
    const placeholder = usePresentToInputText(bibleSelected, bookKey, 1, 1, 2);

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
                    {bibleList.map((b, i) => <BibleSelectOption key={`${i}`} bibleName={b} />)}
                </select>
            </span>
        </>
    );
}
