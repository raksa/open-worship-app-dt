import ElectronMainController from './ElectronMainController';
import ElectronSettingController from './ElectronSettingController';
import electron from 'electron';

export default class ElectronAppController {
    private static _instance: ElectronAppController | null = null;
    settingController: ElectronSettingController;
    mainController: ElectronMainController;
    constructor() {
        this.settingController = new ElectronSettingController(this);
        this.mainController = ElectronMainController.getInstance();
        this.settingController.syncMainWindow();
        electron.app.on('activate', () => {
            if (electron.BrowserWindow.getAllWindows().length === 0) {
                this.mainController = ElectronMainController.getInstance();
                this.settingController.syncMainWindow();
            }
        });
    }
    get mainWin() {
        return this.mainController.win;
    }
    static getInstance() {
        if (this._instance === null) {
            this._instance = new ElectronAppController();
        }
        return this._instance;
    }
}
