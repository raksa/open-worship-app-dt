import { app, BrowserWindow } from 'electron';

import ElectronFinderController from './ElectronFinderController';
import ElectronMainController from './ElectronMainController';
import ElectronSettingController from './ElectronSettingController';
import { getCurrent } from './fsServe';

let instance: ElectronAppController | null = null;
let settingController: ElectronSettingController | null = null;
let finderController: ElectronFinderController | null = null;
export default class ElectronAppController {
    constructor() {
        this.settingController.syncMainWindow(this.mainWin);
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.settingController.syncMainWindow(this.mainWin);
            }
        });
        const webContents = this.mainWin.webContents;
        webContents.on('did-finish-load', () => {
            this.settingController.mainHtmlPath = getCurrent(webContents);
        });
    }

    get mainWin() {
        return this.mainController.win;
    }

    get settingController() {
        if (settingController === null) {
            settingController = new ElectronSettingController();
        }
        return settingController;
    }

    get mainController() {
        return ElectronMainController.getInstance(this.settingController);
    }

    get finderController() {
        if (finderController === null) {
            finderController = new ElectronFinderController();
        }
        return finderController;
    }

    static getInstance() {
        if (instance === null) {
            instance = new ElectronAppController();
        }
        return instance;
    }
}
