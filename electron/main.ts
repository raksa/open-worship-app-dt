const electron = require('electron')
import AppManager from './AppManager';
import {
    initMainScreen, initDisplayObserver,
} from './eventListener';
import initMenu from './initMenu';


electron.app.whenReady().then(() => {
    const appManager = new AppManager();
    initMainScreen(appManager);
    initDisplayObserver(appManager);
    initMenu(appManager);
});

