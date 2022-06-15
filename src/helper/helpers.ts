import { useState, useEffect } from 'react';
import appProvider from './appProvider';
import fileHelpers, { FileSource } from './fileHelper';

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
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
export const cloneObject = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

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
export function toSlideItemThumbSelected(filePath: string | null, id: string | null) {
    if (filePath === null || id === null) {
        return null;
    }
    return `${filePath},${id}`;
}
export function extractSlideItemThumbSelected(slideFilePathId: string) {
    const [slideFilePath, id] = slideFilePathId.split(',');
    return { slideFilePath, id };
}
export function parseSlideItemThumbSelected(selected: string, filePath: string | null) {
    if (!selected || filePath === null) {
        return null;
    }
    try {
        if (~selected.indexOf(filePath)) {
            const id = selected.split(',')[1];
            if (id) {
                return { id };
            }
        }
    } catch (error) {
        console.log(error);
    }
    return null;
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
export function validateMeta(meta: any) {
    try {
        if (meta.fileVersion === 1 && meta.app === 'OpenWorship') {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}
export function useReadFileToData<T>(fileSource: FileSource,
    validator: (json: any) => boolean) {
    const [data, setData] = useState<T | null>(null);
    useEffect(() => {
        fileSource.readFileToData<T>(validator).then(setData);
    }, [fileSource.filePath]);
    return data;
}
