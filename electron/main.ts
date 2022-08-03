import AppManager from './AppManager';
import {
    initMainScreen,
    initDisplayObserver,
} from './eventListener';
import { initMenu } from './menu';

const electron = require('electron');

electron.app.whenReady().then(() => {
    const appManager = new AppManager();
    initMainScreen(appManager);
    initDisplayObserver(appManager);
    initMenu(appManager);
});

