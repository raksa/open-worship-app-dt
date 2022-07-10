const crypto = require('crypto');
const electron = require('electron');
const { dialog, ipcMain, app, screen } = electron;
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
    return `${timeStr}.${md5sum.digest('hex')}`;
}

function initMainScreen(appManager) {
    // TODO: use shareProps.mainWin.on or shareProps.presentWin.on
    ipcMain.on('main:app:show-present', () => {
        appManager.isShowingPS = true;
    });
    ipcMain.on('main:app:hide-present', () => {
        appManager.isShowingPS = false;
    });
    ipcMain.on('main:app:present-eval-script', (_, args) => {
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
        event.returnValue = appManager.isShowingPS;
    });

    ipcMain.on('main:app:is-rendered', (_, replyEventName) => {
        ipcMain.once(replyEventName, (_, data) => {
            data.show = appManager.isShowingPS;
            appManager.mainWin.webContents.send(replyEventName, data);
        });
        appManager.presentWin.webContents.send('app:present:get-rendering-info', replyEventName);
    });

    ipcMain.on('present:app:change-bible', (_, isNext) => {
        appManager.mainWin.webContents.send('app:main:present-change-bible', isNext);
    });
    ipcMain.on('present:app:ctrl-scrolling', (_, isUp) => {
        appManager.mainWin.webContents.send('app:main:present-ctrl-scrolling', isUp);
    });
    ipcMain.on('present:app:hide-present', () => {
        appManager.isShowingPS = false;
        appManager.mainWin.webContents.send('app:main:hiding-present');
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
function initDisplayObserver(appManager) {
    const sendDisplayChanged = () => {
        appManager.mainWin.webContents.send('app:main:display-changed');
    };
    const genDisplayInfo = () => {
        return {
            presentDisplay: appManager.settingController.presentDisplay,
            displays: appManager.settingController.allDisplays,
        };
    };
    screen.on('display-added', sendDisplayChanged);
    screen.on('display-removed', sendDisplayChanged);
    ipcMain.on('main:app:get-displays', (event) => {
        event.returnValue = genDisplayInfo();
    });
    ipcMain.on('main:app:set-displays', (event, { presentDisplayId }) => {
        try {
            appManager.settingController.presentDisplayId = presentDisplayId;
            event.returnValue = genDisplayInfo();
            appManager.settingController.syncPresentWindow();
            sendDisplayChanged();
            return;
        } catch (error) {
            console.log(error);
        }
        event.returnValue = null;
    });
}

module.exports = {
    initMainScreen,
    initDisplayObserver,
};
