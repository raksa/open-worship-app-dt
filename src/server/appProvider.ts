import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import * as diff from 'diff';

export type MessageEventType = {
    returnValue: any,
};

export type MessageUtilsType = {
    channels: { screenMessageChannel: string },
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
    createReadStream: typeof fs.createReadStream,
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
    watch: typeof fs.watch,
};

export type PathUtilsType = {
    sep: typeof path.sep,
    basename: typeof path.basename,
    dirname: typeof path.dirname,
    resolve: typeof path.resolve,
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
};

export enum AppTypeEnum {
    Desktop = 'desktop',
    Web = 'web',
    Mobile = 'mobile',
}

export type PagePropsType = {
    isPageFinder: boolean,
    finderHomePage: string,
    isPagePresenter: boolean,
    presenterHomePage: string,
    isPageEditor: boolean,
    editorHomePage: string,
    isPageReader: boolean,
    readerHomePage: string,
    isPageScreen: boolean,
    screenHomePage: string,
    isPageSetting: boolean,
    settingHomePage: string,
}

const appProvider = (window as any).provider as Readonly<PagePropsType & {
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
    diffUtils: typeof diff,
    pathUtils: PathUtilsType,
    systemUtils: SystemUtilsType,
    appInfo: AppInfoType,
    reload: () => void,
    appUtils: AppUtilsType,
    presenterHomePage: string,
    readerHomePage: string,
    currentHomePage: string,
}>;

export default appProvider;
