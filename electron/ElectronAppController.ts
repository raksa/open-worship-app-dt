import ElectronFinderController from './ElectronFinderController';
import ElectronMainController from './ElectronMainController';
import ElectronSettingController from './ElectronSettingController';
import electron from 'electron';

export default class ElectronAppController {
    private static _instance: ElectronAppController | null = null;
    private _settingController: ElectronSettingController | null = null;
    private _finderController: ElectronFinderController | null = null;
    constructor() {
        this.settingController.syncMainWindow();
        const app = electron.app;
        app.on('activate', () => {
            if (electron.BrowserWindow.getAllWindows().length === 0) {
                this.settingController.syncMainWindow();
            }
        });
    }
    get mainWin() {
        return this.mainController.win;
    }
    get settingController() {
        if (this._settingController === null) {
            this._settingController = new ElectronSettingController(this);
        }
        return this._settingController;
    }
    get mainController() {
        return ElectronMainController.getInstance();
    }
    get finderController() {
        if (this._finderController === null) {
            this._finderController = new ElectronFinderController();
        }
        return this._finderController;
    }
    static getInstance() {
        if (this._instance === null) {
            this._instance = new ElectronAppController();
        }
        return this._instance;
    }
}
