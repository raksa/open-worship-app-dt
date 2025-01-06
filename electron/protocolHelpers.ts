import { join, resolve } from 'node:path';
import { BrowserWindow } from 'electron';

import {
    rootUrl as fsServeRootUrl, preloadFileMap, toTitleCase,
} from './fsServe.js';
import { isDev } from './electronHelpers.js';

function getPreloadFilePath(htmlFileFullName: string) {
    const preloadName = (
        preloadFileMap.minimal.includes(htmlFileFullName) ? 'minimal' : 'full'
    );
    return resolve(join(
        __dirname, 'client', `preload${toTitleCase(preloadName)}.js`,
    ));
}

export function genRoutProps(htmlFileFullName: string) {
    const preloadFilePath = getPreloadFilePath(htmlFileFullName);
    const loadURL = (browserWindow: BrowserWindow, query: string = '') => {
        const rootUrl = isDev ? 'https://localhost:3000' : fsServeRootUrl;
        browserWindow.loadURL(`${rootUrl}/${htmlFileFullName}${query}`);
    };
    return { loadURL, preloadFilePath };
}
