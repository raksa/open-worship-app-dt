import { useState, useEffect } from 'react';
import { toastEventListener } from '../event/ToastEventListener';
import appProvider from './appProvider';

let fontListGlobal: string[] | null = null;
export function useFontList() {
    const [fontListString, setFontListString] = useState<string[] | null>(null);
    useEffect(() => {
        if (fontListString === null) {
            if (fontListGlobal !== null) {
                setFontListString(fontListGlobal);
                return;
            }
            appProvider.fontList.getFonts().then((fonts) => {
                const newFontList = fonts.map((fontString) => {
                    return fontString.replace(/'/g, '');
                });
                fontListGlobal = newFontList;
                setFontListString(newFontList);
            }).catch((error) => {
                console.log(error);
                toastEventListener.showSimpleToast({
                    title: 'Loading Fonts',
                    message: 'Fail to load font list',
                });
            });
        }
    });
    return fontListString;
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
