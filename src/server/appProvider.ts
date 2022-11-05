import http from 'http';
import fs from 'fs';
import path from 'path';

export type MessageEventType = {
    returnValue: any,
};

export type MessageUtilsType = {
    channels: {
        presentMessageChannel: string,
    },
    sendData: (channel: string, ...args: any[]) => void,
    sendDataSync: (channel: string, ...args: any[]) => any,
    listenForData: (channel: string,
        callback: (event: MessageEventType, ...args: any[]) => void) => void,
    listenOnceForData: (channel: string,
        callback: (event: MessageEventType, ...args: any[]) => void) => void,
};

export type FileUtilsType = {
    createWriteStream: typeof fs.createWriteStream,
    readdir: typeof fs.readdir,
    stat: typeof fs.stat,
    mkdir: typeof fs.mkdir,
    writeFile: typeof fs.writeFile,
    rename: typeof fs.rename,
    unlink: typeof fs.unlink,
    rmdir: typeof fs.rmdir,
    readFile: typeof fs.readFile,
    copyFile: typeof fs.copyFile,
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
export type FontListType = {
    [key: string]: string[],
};
export type AppUtilsType = {
    handleError: (error: any) => void,
};
export type PdfUtilsType = {
    toPdf: (filePath: string, outputDir: string) => Promise<void>,
}

const appProvider = (window as any).provider as {
    isMain: boolean,
    isPresent: boolean,
    fontUtils: {
        getFonts: () => Promise<FontListType>,
    };
    cryptoUtils: {
        encrypt: (text: string, key: string) => string,
        decrypt: (text: string, key: string) => string,
    };
    browserUtils: {
        openExplorer: (dir: string) => void,
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
    reload: () => void,
    appUtils: AppUtilsType,
    pdfUtils: PdfUtilsType,
};

export default appProvider;
