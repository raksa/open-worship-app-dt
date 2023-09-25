import './BibleSearchPopup.scss';

import { useState } from 'react';
import BibleSearchRender from './BibleSearchRender';
import { useModal } from '../app-modal/Modal';
import BibleItem from '../bible-list/BibleItem';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    SELECTED_BIBLE_SETTING_NAME,
} from '../helper/bible-helpers/bibleHelpers';
import { setSetting } from '../helper/settingHelper';
import { useModalTypeData } from '../app-modal/helpers';

export default function BibleSearchPopup() {
    const { closeModal, Modal } = useModal();
    const { data } = useModalTypeData();
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
    }, [data, inputText]);
    return (
        <Modal>
            {inputText === null ? (
                <div>
                    <span title='Need translation'>(*T)</span>
                    Loading...
                </div>
            ) : (
                <BibleSearchRender
                    editingInputText={inputText}
                    closeBibleSearch={closeModal} />
            )
            }
        </Modal>
    );
}
