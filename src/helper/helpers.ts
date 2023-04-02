import { useState } from 'react';
import { useAppEffect } from './debuggerHelpers';
import { handleError } from './errorHelpers';
import FileSource from './FileSource';
import ItemSource from './ItemSource';

export type AnyObjectType = {
    [key: string]: any;
};

export function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
export const cloneJson = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
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
        handleError(error);
    }
    return false;
}
export function useReadFileToData<T extends ItemSource<any>>(
    fileSource: FileSource | null) {
    const [data, setData] = useState<T | null | undefined>(null);
    useAppEffect(() => {
        if (fileSource !== null) {
            fileSource.readFileToJsonData().then((itemSource: any) => {
                setData(itemSource);
            });
        }
    }, [fileSource]);
    return data;
}

export function getLastItem<T>(arr: T[]) {
    return arr[arr.length - 1] || null;
}

export function getImageDim(src: string) {
    return new Promise<[number, number]>((resolve, reject) => {
        const img = document.createElement('img');
        img.src = src;
        img.onload = () => {
            resolve([img.naturalWidth, img.naturalHeight]);
        };
        img.onerror = () => {
            reject(new Error('Fail to load image:' + src));
        };
    });
}

export function getVideoDim(src: string) {
    return new Promise<[number, number]>((resolve, reject) => {
        const video = document.createElement('video');
        video.addEventListener('loadedmetadata', () => {
            resolve([video.videoWidth, video.videoHeight]);
        }, false);
        video.onerror = () => {
            reject(new Error('Fail to load video:' + src));
        };
        video.src = src;
    });
}

export function toMaxId(ids: number[]) {
    return Math.max.apply(Math, ids);
}

export function isValidJson(json: any, isSilent: boolean = false) {
    try {
        return JSON.parse(json);
    } catch (error) {
        if (!isSilent && json === '') {
            console.trace('Invalid Json:', json);
        }
        return false;
    }
}

export function isColor(strColor: string) {
    const s = new Option().style;
    s.color = strColor;
    return !!s.color;
}
