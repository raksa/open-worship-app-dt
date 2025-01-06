import { app, protocol } from 'electron';

import {
    customScheme, initCustomSchemeHandler, schemePrivileges,
} from './fsServe.js';
protocol.registerSchemesAsPrivileged([{
    scheme: customScheme, privileges: schemePrivileges,
}]);

import ElectronAppController from './ElectronAppController.js';
import {
    initEventFinder, initEventListenerApp, initEventOther, initEventScreen,
} from './electronEventListener.js';
import { initMenu } from './electronMenu.js';
import { initDevtools } from './devtools.js';
import { isDev } from './electronHelpers.js';

async function main() {
    if (isDev) {
        app.commandLine.appendSwitch('ignore-certificate-errors');
    }
    await app.whenReady();
    const gotTheLock = app.requestSingleInstanceLock({
        myKey: 'open-worship-app',
    });
    if (!gotTheLock) {
        app.quit();
        return;
    }
    initCustomSchemeHandler();
    const appController = ElectronAppController.getInstance();
    initEventListenerApp(appController);
    initEventScreen(appController);
    initEventFinder(appController);
    initEventOther(appController);
    initMenu(appController);
    initDevtools(appController);
}

main();
