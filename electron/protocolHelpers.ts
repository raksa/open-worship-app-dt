import { BrowserWindow } from 'electron';

import { rootUrl as fsServeRootUrl, toTitleCase } from './fsServe';
import { isDev } from './electronHelpers';

export function genRoutProps(htmlFileFullName: string) {
    const htmlFileName = htmlFileFullName.split('.')[0];
    const preloadFileFullName = `preload${toTitleCase(htmlFileName)}.js`;
    const preloadFile = `${__dirname}/client/${preloadFileFullName}`;
    const loadURL = (browserWindow: BrowserWindow, query: string = '') => {
        const rootUrl = isDev ? 'https://localhost:3000' : fsServeRootUrl;
        browserWindow.loadURL(`${rootUrl}/${htmlFileFullName}`);
    };
    return {
        loadURL,
        preloadFile,
    };
}
