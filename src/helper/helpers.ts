import { useState, useEffect } from 'react';
import { toastEventListener } from '../event/ToastEventListener';
import appProvider from './appProvider';
import FileSource from './FileSource';
import ItemSource from './ItemSource';

export type AnyObjectType = {
    [key: string]: any;
};

export function getAppInfo() {
    return appProvider.ipcRenderer.sendSync('main:app:info') as {
        name: string,
        version: string,
        description: string,
    };
}

export function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
export const cloneObject = <T>(obj: T): T => {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
};

// https://stackoverflow.com/a/41698614/17066360
export function isVisible(elem: any) {
    const style = getComputedStyle(elem);
    if (style.display === 'none') { return false; }
    if (style.visibility !== 'visible') { return false; }
    if (+style.opacity < 0.1) { return false; }
    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false;
    }
    const elemCenter = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2,
    };
    if (elemCenter.x < 0) {
        return false;
    }
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) {
        return false;
    }
    if (elemCenter.y < 0) {
        return false;
    }
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) {
        return false;
    }
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
    do {
        if (pointContainer === elem) {
            return true;
        }
        pointContainer = pointContainer?.parentNode as any;
    } while (!!pointContainer);
    return false;
}


export function getFontData(fontName: string) {
    const fontBR = require('../fonts/Battambang/Battambang-Regular.ttf') as { default: string };
    const fontBB = require('../fonts/Battambang/Battambang-Bold.ttf') as { default: string };
    const font = {
        'Battambang-Regular': fontBR.default,
        'Battambang-Bold': fontBB.default,
    }[fontName];
    return `${window.location.origin}${font}`;
}
export function getInnerHTML(div: HTMLDivElement) {
    const html = div.outerHTML;
    const parentDiv = document.createElement('div');
    parentDiv.innerHTML = html;
    cleanDiv(parentDiv.children);
    return parentDiv.innerHTML;
}
function cleanDiv(children: HTMLCollection) {
    for (const child of Array.from(children)) {
        if (child instanceof HTMLElement) {
            child.className = '';
            child.id = '';
            child.contentEditable = 'inherit';
            cleanDiv(child.children);
        }
    }
}

// remove unused methods

export function getRotationDeg(str: string) {
    const match = str.match(/rotate\((.+)deg\)/);
    return match ? +match[1] : 0;
}
export const removePX = (str: string) => +str.replace('px', '');

export function genRandomString(length: number = 5) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}
export const toBase64 = (str: string) => Buffer.from(str, 'utf-8').toString('base64');
export const fromBase64 = (str: string) => Buffer.from(str, 'base64').toString('utf-8');

export function getWindowDim() {
    const width = window.innerWidth || document.documentElement.clientWidth ||
        document.body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight ||
        document.body.clientHeight;
    return { width, height };
}
export function validateAppMeta(meta: any) {
    try {
        if (meta.fileVersion === 1 && meta.app === 'OpenWorship') {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}
export function useReadFileToData<T extends ItemSource<any>>(
    fileSource: FileSource | null) {
    const [data, setData] = useState<T | null | undefined>(null);
    useEffect(() => {
        if (fileSource !== null) {
            fileSource.readFileToData().then((itemSource: any) => {
                setData(itemSource);
            });
        }
    }, [fileSource]);
    return data;
}

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
                    return fontString.replace(/"/g, '');
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
