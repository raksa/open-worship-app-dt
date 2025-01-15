import './BibleSearchPopupComp.scss';

import { useState } from 'react';

import RenderBibleSearchComp from './RenderBibleSearchComp';
import { ModalComp } from '../app-modal/ModalComp';
import BibleItem from '../bible-list/BibleItem';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { SELECTED_BIBLE_SETTING_NAME } from '../bible-list/bibleHelpers';
import { setSetting } from '../helper/settingHelpers';
import { getPopupWindowTypeData } from '../app-modal/helpers';
import LoadingComp from '../others/LoadingComp';

export default function BibleSearchPopupComp() {
    const { data } = getPopupWindowTypeData();
    const bibleItem = BibleItem.parseBibleSearchData(data);
    const [inputText, setInputText] = useState<string | null>(
        bibleItem !== null ? null : '',
    );
    useAppEffectAsync(
        async (methodContext) => {
            if (bibleItem === null || inputText !== null) {
                return;
            }
            setSetting(SELECTED_BIBLE_SETTING_NAME, bibleItem.bibleKey);
            const title = await bibleItem.toTitle();
            methodContext.setInputText(title);
        },
        [bibleItem, inputText],
        { setInputText },
    );
    return (
        <ModalComp>
            {inputText === null ? (
                <LoadingComp />
            ) : (
                <RenderBibleSearchComp editorInputText={inputText} />
            )}
        </ModalComp>
    );
}
