import ElectronAppController from './ElectronAppController';
import {
    initApp, initPresent,
} from './eventListener';
import { initMenu } from './electronMenu';

const electron = require('electron');

electron.app.whenReady().then(() => {
    const appController = new ElectronAppController();
    initApp(appController);
    initPresent(appController);
    initMenu(appController);
});

