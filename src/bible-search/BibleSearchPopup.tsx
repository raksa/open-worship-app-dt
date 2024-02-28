import './BibleSearchPopup.scss';

import { useState } from 'react';

import RenderBibleSearch from './RenderBibleSearch';
import { useModal } from '../app-modal/Modal';
import BibleItem from '../bible-list/BibleItem';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    SELECTED_BIBLE_SETTING_NAME,
} from '../bible-list/bibleHelpers';
import { setSetting } from '../helper/settingHelper';
import { usePopupWindowsTypeData } from '../app-modal/helpers';

export default function BibleSearchPopup() {
    const { Modal } = useModal();
    const { data } = usePopupWindowsTypeData();
    const bibleItem = BibleItem.parseBibleSearchData(data);
    const [inputText, setInputText] = useState<string | null>(
        bibleItem !== null ? null : '',
    );
    useAppEffect(() => {
        if (bibleItem === null || inputText !== null) {
            return;
        }
        setSetting(SELECTED_BIBLE_SETTING_NAME, bibleItem.bibleKey);
        bibleItem.toTitle().then((title) => {
            setInputText(title);
        });
    }, [bibleItem, inputText]);
    return (
        <Modal>
            {inputText === null ? (
                <div>
                    <span title='Need translation'>(*T)</span> Loading...
                </div>
            ) : (
                <RenderBibleSearch editingInputText={inputText} />
            )}
        </Modal>
    );
}
