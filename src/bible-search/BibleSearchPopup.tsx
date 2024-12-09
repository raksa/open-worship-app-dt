import './BibleSearchPopup.scss';

import { useState } from 'react';

import RenderBibleSearch from './RenderBibleSearch';
import { Modal } from '../app-modal/Modal';
import BibleItem from '../bible-list/BibleItem';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import {
    SELECTED_BIBLE_SETTING_NAME,
} from '../bible-list/bibleHelpers';
import { setSetting } from '../helper/settingHelpers';
import { usePopupWindowsTypeData } from '../app-modal/helpers';

export default function BibleSearchPopup() {
    const { data } = usePopupWindowsTypeData();
    const bibleItem = BibleItem.parseBibleSearchData(data);
    const [inputText, setInputText] = useState<string | null>(
        bibleItem !== null ? null : '',
    );
    useAppEffectAsync(async (methodContext) => {
        if (bibleItem === null || inputText !== null) {
            return;
        }
        setSetting(SELECTED_BIBLE_SETTING_NAME, bibleItem.bibleKey);
        const title = await bibleItem.toTitle();
        methodContext.setInputText(title);
    }, [bibleItem, inputText], { methods: { setInputText } });
    return (
        <Modal>
            {inputText === null ? (
                <div>
                    <span title='Need translation'>(*T)</span> Loading...
                </div>
            ) : (
                <RenderBibleSearch editorInputText={inputText} />
            )}
        </Modal>
    );
}
