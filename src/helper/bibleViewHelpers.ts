import { CSSProperties, createContext, useContext } from 'react';

export function fontSizeToHeightStyle(fontSize: number): CSSProperties {
    return { height: fontSize >= 20 ? (fontSize + 30) : undefined };
}

export const DEFAULT_BIBLE_TEXT_FONT_SIZE = 16;
export const BibleViewFontSizeContext = createContext<number>(
    DEFAULT_BIBLE_TEXT_FONT_SIZE,
);

export function useBibleViewFontSizeContext() {
    const fontSize = useContext(BibleViewFontSizeContext);
    return fontSize;
}
