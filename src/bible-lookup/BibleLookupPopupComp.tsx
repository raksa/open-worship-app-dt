import './BibleLookupPopupComp.scss';

import { useState } from 'react';

import RenderBibleLookupComp from './RenderBibleLookupComp';
import { ModalComp } from '../app-modal/ModalComp';
import BibleItem from '../bible-list/BibleItem';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { getPopupWindowTypeData } from '../app-modal/helpers';
import LoadingComp from '../others/LoadingComp';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';

export default function BibleLookupPopupComp() {
    const { data } = getPopupWindowTypeData();
    const bibleItem = BibleItem.parseBibleLookupData(data);
    const [inputText, setInputText] = useState<string | null>(
        bibleItem !== null ? null : '',
    );
    useAppEffectAsync(
        async (methodContext) => {
            if (bibleItem === null || inputText !== null) {
                return;
            }
            LookupBibleItemViewController.getInstance().bibleKey =
                bibleItem.bibleKey;
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
                <RenderBibleLookupComp editorInputText={inputText} />
            )}
        </ModalComp>
    );
}
