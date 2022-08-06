import ElectronMainController from './ElectronMainController';
import ElectronSettingController from './ElectronSettingController';
const electron = require('electron');

export default class ElectronAppController {
    settingController: ElectronSettingController;
    mainController: ElectronMainController;
    constructor() {
        this.settingController = new ElectronSettingController(this);
        this.mainController = new ElectronMainController();
        this.settingController.syncMainWindow();
        electron.app.on('activate', () => {
            if (electron.BrowserWindow.getAllWindows().length === 0) {
                this.mainController = new ElectronMainController();
                this.settingController.syncMainWindow();
            }
        });
    }
    get mainWin(){
        return this.mainController.win;
    }
}
