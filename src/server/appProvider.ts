import http from 'node:http';
import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import { createInterface } from 'node:readline';
import path from 'node:path';

import pdfjsLibType from 'pdfjs-dist';
import tar from 'tar';

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
    createReadStream: typeof fs.createReadStream,
    createInterface: typeof createInterface,

    stat: typeof fs.stat,
    statSync: typeof fs.statSync,
    statPromise: typeof fsPromise.stat,

    readdir: typeof fs.readdir,
    readdirSync: typeof fs.readdirSync,
    readdirPromise: typeof fsPromise.readdir,

    mkdir: typeof fs.mkdir,
    mkdirSync: typeof fs.mkdirSync,
    mkdirPromise: typeof fsPromise.mkdir,

    rmdir: typeof fs.rmdir,
    rmdirSync: typeof fs.rmdirSync,
    rmdirPromise: typeof fsPromise.rmdir,

    readFile: typeof fs.readFile,
    readFileSync: typeof fs.readFileSync,
    readFilePromise: typeof fsPromise.readFile,

    writeFile: typeof fs.writeFile,
    writeFileSync: typeof fs.writeFileSync,
    writeFilePromise: typeof fsPromise.writeFile,

    rename: typeof fs.rename,
    renameSync: typeof fs.renameSync,
    renamePromise: typeof fsPromise.rename,

    unlink: typeof fs.unlink,
    unlinkSync: typeof fs.unlinkSync,
    unlinkPromise: typeof fsPromise.unlink,


    copyFile: typeof fs.copyFile,
    copyFileSync: typeof fs.copyFileSync,
    copyFilePromise: typeof fsPromise.copyFile,

    appendFile: typeof fs.appendFile,
    appendFileSync: typeof fs.appendFileSync,
    appendFilePromise: typeof fsPromise.appendFile,

    tarExtract: typeof tar.x,
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
};
export type FontListType = {
    [key: string]: string[],
};
export type AppUtilsType = {
    handleError: (error: any) => void,
    base64Encode: (str: string) => string,
    base64Decode: (str: string) => string,
};
export type PdfUtilsType = {
    toPdf: (filePath: string, outputDir: string) => Promise<void>,
    pdfjsLib: typeof pdfjsLibType,
}

export enum AppTypeEnum {
    Desktop = 'desktop',
    Web = 'web',
    Mobile = 'mobile',
}

const appProvider = (window as any).provider as {
    isMain: boolean,
    isPresent: boolean,
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
};

export default appProvider;
