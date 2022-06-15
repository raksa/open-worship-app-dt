import { useEffect, useState } from 'react';
import bibleHelper, { useGetBibleWithStatus, useGetBookKVList } from '../bible-helper/bibleHelpers';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { setSetting } from '../helper/settingHelper';
import { toInputText } from '../bible-helper/helpers2';
import { usePresentToInputText } from '../bible-helper/helpers1';

export function BibleSelectOption({ bible }: { bible: string }) {
    const bibleStatus = useGetBibleWithStatus(bible);
    if(bibleStatus === null) {
        return null;
    }
    const [bible1, isAvailable, bibleName] = bibleStatus;
    return (
        <option disabled={!isAvailable}
            value={bible1}>{bibleName}</option>
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
                    {bibleList.map((b, i) => <BibleSelectOption key={`${i}`} bible={b} />)}
                </select>
            </span>
        </>
    );
}
