import nodeFs from 'fs';
import nodePath from 'path';
import electronNS from 'electron';
import https from 'https';
import crypto from 'crypto';
import url from 'url';
import { BookType } from '../bible-helper/bibleHelper';

export default (window as any).provider as {
    fs: typeof nodeFs;
    path: typeof nodePath;
    https: typeof https;
    electron: typeof electronNS;
    ipcRenderer: typeof electronNS.ipcRenderer;
    crypto: typeof crypto;
    url: typeof url;
    cipher: {
        encrypt: (text: string, key: string) => string,
        decrypt: (text: string, key: string) => string,
    };
    bibleObj: {
        booksOrder: string[],
        books: { [key: string]: BookType },
        kjvKeyValue: { [key: string]: string },
    };
};
