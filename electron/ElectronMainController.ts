import { BrowserWindow, shell } from 'electron';

import { channels, ScreenMessageType } from './electronEventListener.js';
import { genRoutProps } from './protocolHelpers.js';
import ElectronSettingController from './ElectronSettingController.js';
import { isSecured } from './electronHelpers.js';

let instance: ElectronMainController | null = null;
export default class ElectronMainController {
    win: BrowserWindow;

    constructor(settingController: ElectronSettingController) {
        this.win = this.createMainWindow(settingController);
    }

    previewPdf(pdfFilePath: string) {
        const mainWin = this.win;
        const pdfWin = new BrowserWindow({
            parent: mainWin,
        });
        pdfWin.loadURL(pdfFilePath);
    }

    createMainWindow(settingController: ElectronSettingController) {
        const routeProps = genRoutProps(settingController.mainHtmlPath);
        const win = new BrowserWindow({
            backgroundColor: '#000000',
            x: 0, y: 0,
            webPreferences: {
                webSecurity: isSecured,
                nodeIntegration: true,
                contextIsolation: false,
                preload: routeProps.preloadFilePath,
            },
        });
        win.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });
        win.on('closed', () => {
            process.exit(0);
        });
        routeProps.loadURL(win);
        return win;
    }

    close() {
        this.win.close();
        process.exit(0);
    }

    sendData(channel: string, data?: any) {
        this.win.webContents.send(channel, data);
    }

    sendMessage(message: ScreenMessageType) {
        this.win.webContents.send(
            channels.screenMessageChannel, message);
    }

    changeBible(isNext: boolean) {
        this.sendData('app:main:change-bible', isNext);
    }

    ctrlScrolling(isUp: boolean) {
        this.sendData('app:main:ctrl-scrolling', isUp);
    }

    sendNotifyInvisibility(screenId: number) {
        this.sendMessage({
            screenId,
            type: 'visible',
            data: {
                isShowing: false,
            },
        });
    }

    static getInstance(settingController: ElectronSettingController) {
        if (instance === null) {
            instance = new this(settingController);
        }
        return instance;
    }
}
