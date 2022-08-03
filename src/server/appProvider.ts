import http from 'http';
import fs from 'fs';
import path from 'path';

export type MessageEventType = {
    returnValue: any,
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
    messageUtils: {
        sendData: (channel: string, ...args: any[]) => void,
        sendSyncData: (channel: string, ...args: any[]) => any,
        listenForData: (channel: string,
            callback: (event: MessageEventType, ...args: any[]) => void) => void,
        listenOnceForData: (channel: string,
            callback: (event: MessageEventType, ...args: any[]) => void) => void,
    };
    httpUtils: {
        request: typeof http.request,
    };
    fileUtils: {
        createWriteStream: typeof fs.createWriteStream,
        readdir: typeof fs.readdir,
        stat: typeof fs.stat,
        mkdirSync: typeof fs.mkdirSync,
        writeFileSync: typeof fs.writeFileSync,
        renameSync: typeof fs.renameSync,
        unlinkSync: typeof fs.unlinkSync,
        readFileSync: typeof fs.readFileSync,
        copyFileSync: typeof fs.copyFileSync,
    },
    pathUtils: {
        sep: typeof path.sep,
        basename: typeof path.basename,
        join: typeof path.join,
    },
};

export default appProvider;
