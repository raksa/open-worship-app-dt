'use strict';

const electron = require('electron');
const AppManager = require('./AppManager');
const eventListener = require('./eventListener');

electron.app.whenReady().then(() => {
    const appManager = new AppManager();
    eventListener.initMainScreen(appManager);
    eventListener.initDisplayObserver(appManager);
});
