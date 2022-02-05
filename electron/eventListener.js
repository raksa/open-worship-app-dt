'use strict';

const crypto = require('crypto');
const electron = require('electron');
const { dialog, ipcMain, app } = electron;
const appPackage = require('../package.json');
const { readValue } = require('./sqlite3');


const isDev = process.env.NODE_ENV === 'development';

let apiUrl = process.env.API_URL;
let key = process.env.API_KEY;
if (!isDev) {
    const ow = require('../build/Release/ow');
    apiUrl = ow.getApiUrl();
    key = ow.getApiKey();
}
function hasXApiKey() {
    const timeStr = Date.now() + '';
    const md5sum = crypto.createHash('md5').update(key + timeStr);
    const text = `${timeStr}.${md5sum.digest('hex')}`;
    return text;
}

function initMainScreen(appManager) {
    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') {
            app.quit();
            // TODO: check why won't quit
        }
    });

    // TODO: use shareProps.mainWin.on or shareProps.presentWin.on
    let presentShown = false;
    ipcMain.on('main:app:show-present', () => {
        appManager.presentWin.show();
        appManager.mainWin.focus();
        presentShown = true;
    });
    const hidePresent = () => {
        appManager.presentWin.close();
        appManager.createPresentWindow();
        appManager.mainWin.focus();
        presentShown = false;
    };
    ipcMain.on('main:app:hide-present', hidePresent);
    ipcMain.on('main:app:present-eval-script', (event, args) => {
        appManager.presentWin.webContents.executeJavaScript(`
        (() => {
            ${args.script};
            addHighlightEvent();
            backup();
        })();
        `);
    });

    ipcMain.on('main:app:info', (event) => {
        event.returnValue = appPackage;
    });

    ipcMain.on('main:app:get-data-path', (event) => {
        event.returnValue = app.getPath('userData');
    });
    ipcMain.on('main:app:select-dirs', async (event) => {
        const result = await dialog.showOpenDialog(appManager.mainWin, {
            properties: ['openDirectory'],
        });
        event.returnValue = result.filePaths;
    });

    ipcMain.on('main:app:is-presenting', (event) => {
        event.returnValue = presentShown;
    });
    ipcMain.on('main:app:present-sreen-info', (event) => {
        event.returnValue = {
            width: appManager.externalDisplay.bounds.width,
            height: appManager.externalDisplay.bounds.height,
        };
    });

    ipcMain.on('main:app:is-rendered', (event, replyEventName) => {
        ipcMain.once(replyEventName, (event1, data) => {
            data.show = presentShown;
            appManager.mainWin.webContents.send(replyEventName, data);
        });
        appManager.presentWin.webContents.send('app:present:get-rendering-info', replyEventName);
    });

    ipcMain.on('present:app:change-bible', (event, isNext) => {
        appManager.mainWin.webContents.send('app:main:present-change-bible', isNext);
    });
    ipcMain.on('present:app:ctrl-scrolling', (event, isUp) => {
        appManager.mainWin.webContents.send('app:main:present-ctrl-scrolling', isUp);
    });
    ipcMain.on('present:app:hide-present', () => {
        hidePresent();
        appManager.mainWin.webContents.send('app:main:hiding-present');
    });
    ipcMain.on('present:app:capture-preview', (event) => {
        try {
            appManager.presentWin.webContents.capturePage({
                x: 0,
                y: 0,
                width: appManager.showWinWidth,
                height: appManager.showWinHeight,
            }).then((img) => {
                img = img.resize(appManager.previewResizeDim);
                const base64 = img.toJPEG(100).toString('base64');
                const data = base64 ? 'data:image/png;base64,' + base64 : '';
                if (data) {
                    appManager.mainWin.webContents.send('app:main:captured-preview', data);
                }
            }).catch((error) => {
                console.log(error);
            });
        } catch (error) {
            console.log(error);
        }
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

module.exports = {
    initMainScreen,
};
