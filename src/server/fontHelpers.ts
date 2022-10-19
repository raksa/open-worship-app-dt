import { useState, useEffect } from 'react';
import ToastEventListener from '../event/ToastEventListener';
import { LocaleType } from '../lang';
import appProvider, {
    FontListType,
} from './appProvider';

export function useFontList() {
    const [fontList, setFontList] = useState<FontListType | null>(null);
    useEffect(() => {
        if (fontList === null) {
            appProvider.fontUtils.getFonts().then((fonts) => {
                setFontList(fonts);
            }).catch((error) => {
                appProvider.appUtils.handleError(error);
                ToastEventListener.showSimpleToast({
                    title: 'Loading Fonts',
                    message: 'Fail to load font list',
                });
            });
        }
    });
    return fontList;
}

export function getFontFace(locale: LocaleType) {
    if (locale === 'km') {
        const fontBR = require('../fonts/Battambang/Battambang-Regular.ttf');
        const fontBB = require('../fonts/Battambang/Battambang-Bold.ttf');
        return `
        @font-face {
            font-family: Battambang;
            src: url(${fontBR.default || fontBR}) format("truetype");
        }
        @font-face {
            font-family: Battambang;
            src: url(${fontBB.default || fontBB}) format("truetype");
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
