import { useState } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { FontListType } from './appProvider';
import { getFontListByNodeFont } from './appHelpers';

function showLoadingFontFail() {
    showSimpleToast('Loading Fonts', 'Fail to load font list');
}

export function useFontList() {
    const [fontList, setFontList] = useState<FontListType | null>(null);
    useAppEffect(() => {
        if (fontList === null) {
            const fonts = getFontListByNodeFont();
            if (fonts === null) {
                showLoadingFontFail();
            } else {
                setFontList(fonts);
            }
        }
    }, [fontList]);
    return fontList;
}
