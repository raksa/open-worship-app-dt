import { BrowserWindow } from 'electron';

import { rootUrl as fsServeRootUrl, registerScheme } from './fsServe';
import { isDev } from './electronHelpers';


const registerHandler = !isDev ? registerScheme() : () => { };

export function genRoutProps(name: string) {
    const preloadFile = `${__dirname}/client/${name}Preload.js`;
    const loadURL = (browserWindow: BrowserWindow, query: string = '') => {
        const urlPathname = name !== 'index' ? `${name}.html` : '';
        let rootUrl = 'http://localhost:3000';
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
