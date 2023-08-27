import { BrowserWindow } from 'electron';

import { scheme, serveProc } from './fsServe';
import { isDev } from './electronHelpers';


const registerHandler = !isDev ? serveProc() : () => { };

export function genRoutProps(routeType: string) {
    const preloadFile = `${__dirname}/client/${routeType}Preload.js`;
    return {
        loadURL: (browserWindow: BrowserWindow, query: string = '') => {
            const urlPathname = routeType !== 'index' ? `/${routeType}.html` : '';
            const fullUrl = `${urlPathname}${query}`;
            if (isDev) {
                const rootUrl = 'http://localhost:3000';
                browserWindow.loadURL(`${rootUrl}${fullUrl}`);
            } else {
                registerHandler();
                browserWindow.loadURL(`${scheme}://-${fullUrl}`);
            }
        },
        preloadFile,
    };
}
