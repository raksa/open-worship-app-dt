'use strict';

const electron = require('electron');
const AppManager = require('./AppManager');
const eventListener = require('./eventListener');
const initMenu = require('./menu');

electron.app.whenReady().then(() => {
    const appManager = new AppManager();
    eventListener.initMainScreen(appManager);
    eventListener.initDisplayObserver(appManager);
    initMenu(appManager);
});

