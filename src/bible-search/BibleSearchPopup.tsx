import './BibleSearchPopup.scss';

import { useState } from 'react';
import Modal from '../others/Modal';
import BibleItem from '../bible-list/BibleItem';
import BibleSearchRender from './BibleSearchRender';
import { setSetting } from '../helper/settingHelper';
import { SELECTED_BIBLE_SETTING_NAME } from '../helper/bibleHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';

export default function BibleSearchPopup() {
    const [inputText, setInputText] = useState<string | null>(null);
    useAppEffect(() => {
        if (inputText !== null) {
            return;
        }
        BibleItem.getSelectedItemEditing().then(async (item) => {
            if (!item) {
                setInputText('');
                return;
            }
            setSetting(SELECTED_BIBLE_SETTING_NAME, item.bibleKey);
            const title = await item.toTitle();
            setInputText(title);
        });
    }, [inputText]);
    return (
        <Modal>
            {inputText === null ?
                <div><span title='Need translation'>(*T)</span> Loading...</div> :
                <BibleSearchRender editingInputText={inputText} />
            }
        </Modal>
    );
}
