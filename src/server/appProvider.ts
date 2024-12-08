import pdfjsLibType from 'pdfjs-dist';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { x } from 'tar';

export type MessageEventType = {
    returnValue: any,
};

export type MessageUtilsType = {
    channels: {
        screenMessageChannel: string,
    },
    sendData: (channel: string, ...args: any[]) => void,
    sendDataSync: (channel: string, ...args: any[]) => any,
    listenForData: (
        channel: string,
        callback: (event: MessageEventType, ...args: any[]) => void
    ) => void,
    listenOnceForData: (
        channel: string,
        callback: (event: MessageEventType, ...args: any[]) => void,
    ) => void,
};

export type FileUtilsType = {
    createWriteStream: typeof fs.createWriteStream,
    createReadStream: typeof fs.createWriteStream,
    readdir: typeof fs.readdir,
    stat: typeof fs.stat,
    mkdir: typeof fs.mkdir,
    writeFile: typeof fs.writeFile,
    rename: typeof fs.rename,
    unlink: typeof fs.unlink,
    rmdir: typeof fs.rmdir,
    readFile: typeof fs.readFile,
    copyFile: typeof fs.copyFile,
    copyBlobFile: (
        blobUrl: string, dest: fs.PathLike, callback: fs.NoParamCallback,
    ) => void,
    tarExtract: typeof x,
    watch: typeof fs.watch,
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
    versionNumber: number;
};
export type FontListType = {
    [key: string]: string[],
};
export type AppUtilsType = {
    handleError: (error: any) => void,
    base64Encode: (str: string) => string,
    base64Decode: (str: string) => string,
    quitApp: () => void,
};
export type PdfUtilsType = {
    officeFileToPdf: (
        filePath: string, outputDir: string, fileFullName: string,
    ) => Promise<void>,
    pdfjsLib: typeof pdfjsLibType,
}

export enum AppTypeEnum {
    Desktop = 'desktop',
    Web = 'web',
    Mobile = 'mobile',
}

const appProvider = (window as any).provider as {
    isPresenter: boolean,
    isReader: boolean,
    isScreen: boolean,
    appType: AppTypeEnum,
    isDesktop: boolean,
    fontUtils: {
        getFonts: () => Promise<FontListType>,
    };
    cryptoUtils: {
        encrypt: (text: string, key: string) => string,
        decrypt: (text: string, key: string) => string,
    };
    browserUtils: {
        copyToClipboard: (str: string) => void,
        pathToFileURL: (filePath: string) => string,
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
    presenterHomePage: string,
    readerHomePage: string,
};

export default appProvider;
