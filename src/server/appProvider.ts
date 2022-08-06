import http from 'http';
import fs from 'fs';
import path from 'path';

export type MessageEventType = {
    returnValue: any,
};

export type MessageUtilsType = {
    sendData: (channel: string, ...args: any[]) => void,
    sendSyncData: (channel: string, ...args: any[]) => any,
    listenForData: (channel: string,
        callback: (event: MessageEventType, ...args: any[]) => void) => void,
    listenOnceForData: (channel: string,
        callback: (event: MessageEventType, ...args: any[]) => void) => void,
};

export type FileUtilsType = {
    createWriteStream: typeof fs.createWriteStream,
    readdir: typeof fs.readdir,
    stat: typeof fs.stat,
    mkdirSync: typeof fs.mkdirSync,
    writeFileSync: typeof fs.writeFileSync,
    renameSync: typeof fs.renameSync,
    unlinkSync: typeof fs.unlinkSync,
    readFileSync: typeof fs.readFileSync,
    copyFileSync: typeof fs.copyFileSync,
};

export type PathUtilsType = {
    sep: typeof path.sep,
    basename: typeof path.basename,
    join: typeof path.join,
};

export type SystemUtilsType = {
    isDev: boolean,
    isWindows: boolean,
    isMac: boolean,
    isLinux: boolean,
};

export type AppInfoType = {
    name: string;
    description: string;
    author: string;
    homepage: string;
    version: string;
};

const appProvider = (window as any).provider as {
    fontList: {
        getFonts: () => Promise<string[]>,
    };
    cryptoUtils: {
        encrypt: (text: string, key: string) => string,
        decrypt: (text: string, key: string) => string,
    };
    browserUtils: {
        openExplorer: (dir: string) => void,
        openLink: (link: string) => void,
        copyToClipboard: (str: string) => void,
        urlPathToFileURL: (urlPath: string) => string,
    };
    messageUtils: MessageUtilsType;
    httpUtils: {
        request: typeof http.request,
    };
    fileUtils: FileUtilsType,
    pathUtils: PathUtilsType,
    systemUtils: SystemUtilsType,
    appInfo: AppInfoType,
};

export default appProvider;
