import { useState } from "react";
import { BiblePresentType } from "../full-text-present/fullTextPresentHelper";
import electronProvider from "./electronProvider";
import { PlaylistType, validatePlaylist } from "./playlistType";
import { getSetting, setSetting } from "./settings";
import { SlidePresentType, SlideItemThumbType, validateSlide } from "../editor/slideType";

export const getAppInfo = () => {
    const info = electronProvider.ipcRenderer.sendSync('main:app:info') as {
        name: string,
        version: string,
        description: string,
    };
    return info;
};

export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
export const cloneObject = <T>(obj: object): T => {
    return JSON.parse(JSON.stringify(obj));
}

// https://stackoverflow.com/a/41698614/17066360
export const isVisible = (elem: any) => {
    const style = getComputedStyle(elem);
    if (style.display === 'none') return false;
    if (style.visibility !== 'visible') return false;
    if (+style.opacity < 0.1) return false;
    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false;
    }
    const elemCenter = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
    };
    if (elemCenter.x < 0) return false;
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
    if (elemCenter.y < 0) return false;
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
    do {
        if (pointContainer === elem) return true;
    } while (!!(pointContainer = pointContainer?.parentNode as any));
    return false;
}

type MimeType = {
    type: string,
    title: string,
    mimeType: string,
    extension: string[],
};
type FileMetadata = { fileName: string, mimeType: MimeType };
const getFileMetaData = (fileName: string, mimeTypes: MimeType[]): FileMetadata | null => {
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const foundMT = mimeTypes.find((mt) => ~mt.extension.indexOf(ext));
    if (foundMT) {
        return { fileName, mimeType: foundMT };
    }
    return null;
}
export type FileResult = {
    fileName: string,
    filePath: string,
    src: string,
}
type MimetypeNameType = 'image' | 'video' | 'slide' | 'playlist';
export const getAppMimetype = (mt: MimetypeNameType) => {
    const mimeType = require(`./mime/${mt}-types.json`) as MimeType[];
    return mimeType;
};
export const isSupportedMimetype = (fileMimetype: string, mt: MimetypeNameType) => {
    const mimeTypes = getAppMimetype(mt);
    return mimeTypes.map((mimeType) => mimeType.mimeType).some((type) => type === fileMimetype);
};
export const listFiles = (dir: string, type: MimetypeNameType) => {
    try {
        const mimeTypes = require(`./mime/${type}-types.json`) as MimeType[];
        const files = electronProvider.fs.readdirSync(dir) as string[];
        const matchedFiles = files.map((fileName) => getFileMetaData(fileName, mimeTypes))
            .filter((d) => !!d) as FileMetadata[];
        const filesList = matchedFiles.map((fileMetadata) => {
            const filePath = electronProvider.path.join(dir, fileMetadata.fileName);
            return {
                fileName: fileMetadata.fileName,
                filePath,
                src: electronProvider.url.pathToFileURL(filePath).toString(),
            }
        });
        return filesList;
    } catch (error) { }
    return null;
}
export const createFile = (txt: string, basePath: string, fileName?: string) => {
    try {
        const filePath = fileName ? electronProvider.path.join(basePath, fileName) : basePath;
        if (!electronProvider.fs.existsSync(filePath)) {
            electronProvider.fs.writeFileSync(filePath, txt);
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}
export const deleteFile = (filePath: string) => {
    try {
        electronProvider.fs.unlinkSync(filePath);
        return true;
    } catch (error) {
        console.log(error);
    }
    return false;
}
export const readFile = (filePath: string) => {
    try {
        const str = electronProvider.fs.readFileSync(filePath, 'utf8') as string;
        return str;
    } catch (error) {
        console.log(error);
        setSlideFilePathSetting('');
    }
    return null;
}
export const copyFileToPath = (filePath: string, fileName: string, destinationPath: string) => {
    try {
        electronProvider.fs.copyFileSync(filePath, electronProvider.path.join(destinationPath, fileName));
        return true;
    } catch (error) {
        console.log(error);
    }
    return false;
}


export const getFontData = (fontName: string) => {
    const fontBR = require('../fonts/Battambang/Battambang-Regular.ttf') as { default: string };
    const fontBB = require('../fonts/Battambang/Battambang-Bold.ttf') as { default: string };
    const font = {
        "Battambang-Regular": fontBR.default,
        "Battambang-Bold": fontBB.default,
    }[fontName];
    return `${window.location.origin}${font}`;
}
export const toSlideItemThumbSelected = (filePath: string | null, id: string | null) => {
    if (filePath === null || id === null) {
        return null;
    }
    return `${filePath},${id}`;
}
export const extractSlideItemThumbSelected = (slideFilePathId: string) => {
    const [slideFilePath, id] = slideFilePathId.split(',');
    return { slideFilePath, id };
}
export const parseSlideItemThumbSelected = (selected: string, filePath: string | null) => {
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

export const getSlideFilePathSetting = () => {
    return getSetting('slide-item-selected') || null;
}
export const setSlideFilePathSetting = (filePath: string) => {
    setSetting('slide-item-selected', filePath);
}
export const saveSlideItemThumbs = (itemThumbs: SlideItemThumbType[]) => {
    // TODO: merge with present
    try {
        const filePath = getSlideFilePathSetting();
        if (filePath !== null) {
            const str = readFile(filePath);
            if (str !== null) {
                const json = JSON.parse(str);
                if (validateSlide(json)) {
                    json.items = itemThumbs;
                    if (deleteFile(filePath) && createFile(JSON.stringify(json), filePath)) {
                        return true;
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    return false;
};
export const getSlideDataByFilePath = (filePath: string) => {
    try {
        const str = readFile(filePath);
        if (str !== null) {
            const json = JSON.parse(str);
            if (validateSlide(json)) {
                const data = json as SlidePresentType;
                data.items.forEach((item) => {
                    item.slideFilePath = filePath;
                });
                return data;
            }
        }
    } catch (error) {
        console.log(error);
    }
    return null;
};
export const savePlaylist = (playlistFilePath: string, playlist: PlaylistType) => {
    try {
        if (deleteFile(playlistFilePath) &&
            createFile(JSON.stringify(playlist), playlistFilePath)) {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
};
export const getPlaylistDataByFilePath = (filePath: string) => {
    try {
        const str = readFile(filePath);
        if (str !== null) {
            const json = JSON.parse(str);
            if (validatePlaylist(json)) {
                const data = json as PlaylistType;
                return data;
            }
        }
    } catch (error) {
        console.log(error);
    }
    return null;
};
export const getInnerHTML = (div: HTMLDivElement) => {
    const html = div.outerHTML;
    const parentDiv = document.createElement('div');
    parentDiv.innerHTML = html;
    cleanDiv(parentDiv.children);
    return parentDiv.innerHTML;
};
const cleanDiv = (children: HTMLCollection) => {
    for (let i = 0; i < children.length; i++) {
        if (children[i] instanceof HTMLElement) {
            const ele = children[i] as HTMLElement;
            ele.className = '';
            ele.id = '';
            ele.contentEditable = 'inherit';
            cleanDiv(ele.children);
        }
    }
};

export const getRotationDeg = (str: string) => {
    const match = str.match(/rotate\((.+)deg\)/);
    return match ? +match[1] : 0;
};
export const removePX = (str: string) => +str.replace('px', '');

export const getBiblePresentingSetting = () => {
    let defaultPresent: BiblePresentType[];
    try {
        defaultPresent = JSON.parse(getSetting('bible-present')) as BiblePresentType[];
    } catch (error) {
        defaultPresent = [];
    }
    return defaultPresent;
};
export const setBiblePresentingSetting = (biblePresent: BiblePresentType[]) => {
    setSetting('bible-present', JSON.stringify(biblePresent));
};

export const genRandomString = (length: number = 5) => {
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

export function useStateSettingBoolean(settingName: string): [boolean, (b: boolean) => void] {
    const defaultData = (getSetting(settingName) || 'false') !== 'false';
    const [data, setData] = useState(defaultData);
    const setDataSetting = (b: boolean) => {
        setData(b);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting];
}
export function useStateSettingString(settingName: string, defaultString: string): [string, (str: string) => void] {
    const defaultData = getSetting(settingName) || defaultString || '';
    const [data, setData] = useState(defaultData);
    const setDataSetting = (b: string) => {
        setData(b);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting];
}
export function useStateSettingNumber(settingName: string, defaultNumber: number): [number, (n: number) => void] {
    const defaultData = +(getSetting(settingName) || NaN);
    const [data, setData] = useState(isNaN(defaultData) ? defaultNumber : defaultData);
    const setDataSetting = (b: number) => {
        setData(b);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting];
}
