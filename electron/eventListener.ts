import AppManager from './AppManager';
import { isDev } from './helpers';
import PresentManager from './PresentManager';

import { readValue } from './sqlite3';
const crypto = require('crypto');
const electron = require('electron');

const { dialog, ipcMain, app } = electron;

let apiUrl = process.env.API_URL;
let key = process.env.API_KEY;
if (!isDev) {
    const ow = require('../build/Release/ow');
    apiUrl = ow.getApiUrl();
    key = ow.getApiKey();
}
function hasXApiKey() {
    const timeStr = Date.now().toString();
    const md5sum = crypto.createHash('md5').update(key + timeStr);
    return `${timeStr}.${md5sum.digest('hex')}`;
}

export function initApp(appManager: AppManager) {
    ipcMain.on('main:app:get-data-path', (event) => {
        event.returnValue = app.getPath('userData');
    });
    ipcMain.on('main:app:select-dirs', async (event) => {
        const result = await dialog.showOpenDialog(appManager.mainWin, {
            properties: ['openDirectory'],
        });
        event.returnValue = result.filePaths;
    });
    ipcMain.on('main:app:select-files', async (event, filters) => {
        const result = await dialog.showOpenDialog(appManager.mainWin, {
            properties: ['openFile', 'multiSelections'],
            filters,
        });
        event.returnValue = result.filePaths;
    });

    ipcMain.on('main:app:db-read', async (event, data) => {
        const value = await readValue(data.dbFilePath, data.table, data.key);
        event.reply(data.waitingEventName, value);
    });

    ipcMain.on('app:app:https-credential', (event) => {
        event.returnValue = {
            apiUrl,
            apiKey: hasXApiKey(),
        };
    });
}
export function initPresent(appManager: AppManager) {
    ipcMain.on('main:app:get-displays', (event) => {
        event.returnValue = {
            primaryDisplay: appManager.settingController.primaryDisplay,
            displays: appManager.settingController.allDisplays,
        };
    });
    ipcMain.on('main:app:get-presents', (event) => {
        event.returnValue = PresentManager.getAllIds();
    });
    // TODO: use shareProps.mainWin.on or shareProps.presentWin.on
    ipcMain.on('main:app:show-present', (event, data: {
        presentId: number,
        displayId: number,
    }) => {
        const presentManager = PresentManager.createInstance(data.presentId);
        const display = appManager.settingController.
            getDisplayById(data.displayId);
        if (display !== undefined) {
            presentManager.setDisplay(display);
            event.returnValue = true;
        } else {
            event.returnValue = true;
        }
    });
    ipcMain.on('main:app:hide-present', (_, presentId: number) => {
        PresentManager.getInstance(presentId)?.hide();
    });
    ipcMain.on('main:app:set-present-display', (event, data: {
        presentId: number,
        displayId: number,
    }) => {
        const display = appManager.settingController.
            getDisplayById(data.displayId);
        const presentManager = PresentManager.getInstance(data.presentId);
        if (display !== undefined && presentManager !== null) {
            presentManager.setDisplay(display);
            event.returnValue = display;
        } else {
            event.returnValue = null;
        }
    });
    ipcMain.on('main-app-present:message', async (_, data: {
        presentId: number,
        message: any,
        replyEventName: string,
    }) => {
        const presentManager = PresentManager.getInstance(data.presentId);
        if (presentManager !== null) {
            const result = presentManager.sendMessage(data.message);
            appManager.mainWin.webContents.send(data.replyEventName, result);
        }
    });
    ipcMain.on('present:app:change-bible', (_, isNext) => {
        appManager.mainManager.changeBible(isNext);
    });
    ipcMain.on('present:app:ctrl-scrolling', (_, isUp) => {
        appManager.mainManager.ctrlScrolling(isUp);
    });
}
