import ElectronFinderController from './ElectronFinderController';
import ElectronMainController from './ElectronMainController';
import ElectronSettingController from './ElectronSettingController';
import electron from 'electron';

let instance: ElectronAppController | null = null;
let settingController: ElectronSettingController | null = null;
let finderController: ElectronFinderController | null = null;
export default class ElectronAppController {

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
        if (settingController === null) {
            settingController = new ElectronSettingController(this);
        }
        return settingController;
    }

    get mainController() {
        return ElectronMainController.getInstance();
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
