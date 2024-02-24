import { useState } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import { handleError } from '../helper/errorHelpers';
import { LocaleType } from '../lang';
import { showSimpleToast } from '../toast/toastHelpers';
import appProvider, {
    FontListType,
} from './appProvider';

export function useFontList() {
    const [fontList, setFontList] = useState<FontListType | null>(null);
    useAppEffect(() => {
        if (fontList === null) {
            appProvider.fontUtils.getFonts().then((fonts) => {
                setFontList(fonts);
            }).catch((error) => {
                handleError(error);
                showSimpleToast('Loading Fonts', 'Fail to load font list');
            });
        }
    });
    return fontList;
}

export function getFontFace(locale: LocaleType) {
    if (locale === 'km') {
        const fontBR = '/fonts/km/Battambang/Battambang-Regular.ttf';
        const fontBB = '/fonts/km/Battambang/Battambang-Bold.ttf';
        return `
        @font-face {
            font-family: Battambang;
            src: url(${fontBR}) format("truetype");
        }
        @font-face {
            font-family: Battambang;
            src: url(${fontBB}) format("truetype");
            font-weight: bold;
        }
        `;
    } else {
        return '';
    }
}

export function getFontFamilyByLocal(locale: LocaleType) {
    if (locale === 'km') {
        return 'Battambang';
    }
    return 'Arial';
}
