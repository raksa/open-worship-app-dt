import AppManager from './AppManager';
import {
    initApp, initPresent,
} from './eventListener';
import { initMenu } from './menu';

const electron = require('electron');

electron.app.whenReady().then(() => {
    const appManager = new AppManager();
    initApp(appManager);
    initPresent(appManager);
    initMenu(appManager);
});

