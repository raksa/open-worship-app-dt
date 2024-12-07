import { BrowserWindow } from 'electron';

import { rootUrl as fsServeRootUrl, htmlFiles } from './fsServe';
import { isDev } from './electronHelpers';

const providerMap = {
    [htmlFiles.presenter]: 'presenter',
    [htmlFiles.reader]: 'reader',
    [htmlFiles.screen]: 'minimal',
    [htmlFiles.finder]: 'minimal',
};
export function genRoutProps(htmlFileFullName: string) {
    const preloadName = providerMap[htmlFileFullName];
    const preloadFile = `${__dirname}/client/${preloadName}Preload.js`;
    const loadURL = (browserWindow: BrowserWindow, query: string = '') => {
        const rootUrl = isDev ? 'https://localhost:3000' : fsServeRootUrl;
        browserWindow.loadURL(`${rootUrl}/${htmlFileFullName}${query}`);
    };
    return {
        loadURL,
        preloadFile,
    };
}
