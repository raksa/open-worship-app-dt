import MainManager from './MainManager';
import SettingController from './SettingController';
const electron = require('electron');

export default class AppManager {
    settingController: SettingController;
    mainManager: MainManager;
    constructor() {
        this.settingController = new SettingController(this);
        this.mainManager = new MainManager();
        this.settingController.syncMainWindow();
        electron.app.on('activate', () => {
            if (electron.BrowserWindow.getAllWindows().length === 0) {
                this.mainManager = new MainManager();
                this.settingController.syncMainWindow();
            }
        });
    }
    get mainWin(){
        return this.mainManager.win;
    }
}
