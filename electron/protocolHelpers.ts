import { BrowserWindow } from 'electron';

import { rootUrl as fsServeRootUrl, registerScheme } from './fsServe';
import { isDev } from './electronHelpers';


const registerHandler = !isDev ? registerScheme() : () => { };

export function genRoutProps(name: string) {
    const preloadName = name === 'index' ? 'index' : 'minimal';
    const preloadFile = `${__dirname}/client/${preloadName}Preload.js`;
    const loadURL = (browserWindow: BrowserWindow, query: string = '') => {
        const urlPathname = name !== 'index' ? `${name}.html` : '';
        let rootUrl = 'https://localhost:3000';
        if (!isDev) {
            registerHandler();
            rootUrl = fsServeRootUrl;
        }
        browserWindow.loadURL(`${rootUrl}/${urlPathname}${query}`);
    };
    return {
        loadURL,
        preloadFile,
    };
}
