import { useState, useEffect } from 'react';
import ToastEventListener from '../event/ToastEventListener';
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
                console.log(error);
                ToastEventListener.showSimpleToast({
                    title: 'Loading Fonts',
                    message: 'Fail to load font list',
                });
            });
        }
    });
    return fontList;
}

export function getFontData(fontName: string) {
    const fontBR = require('../fonts/Battambang/Battambang-Regular.ttf') as { default: string };
    const fontBB = require('../fonts/Battambang/Battambang-Bold.ttf') as { default: string };
    const font = {
        'Battambang-Regular': fontBR.default,
        'Battambang-Bold': fontBB.default,
    }[fontName];
    return `${location.origin}${font}`;
}
