import ElectronAppController from './ElectronAppController';
const fs = require('fs');
const path = require('path');
const electron = require('electron');

export default class ElectronSettingController {
    _setting: {
        mainWinBounds: Electron.Rectangle | null,
        appPresentDisplayId: number | null,
    } = {
            mainWinBounds: null,
            appPresentDisplayId: null,
        };
    appController: ElectronAppController;
    constructor(appController: ElectronAppController) {
        this.appController = appController;
        try {
            const str = fs.readFileSync(this.fileSettingPath, 'utf8');
            const json = JSON.parse(str);
            this._setting.mainWinBounds = json.mainWinBounds;
            this._setting.appPresentDisplayId = json.appPresentDisplayId;
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                this.save();
            } else {
                console.log(error);
            }
        }
    }
    get fileSettingPath() {
        const useDataPath = electron.app.getPath('userData');
        return path.join(useDataPath, 'setting.json');
    }
    get mainWinBounds() {
        return this._setting.mainWinBounds || this.primaryDisplay.bounds;
    }
    set mainWinBounds(bounds) {
        this._setting.mainWinBounds = bounds;
        this.save();
    }
    resetMainBounds() {
        this.mainWinBounds = this.primaryDisplay.bounds;
        this.appController.mainWin.setBounds(this.mainWinBounds);
    }
    get allDisplays() {
        return electron.screen.getAllDisplays();
    }
    get primaryDisplay() {
        return electron.screen.getPrimaryDisplay();
    }
    getDisplayById(id: number) {
        return this.allDisplays.find((newDisplay) => newDisplay.id == id);
    }
    save() {
        fs.writeFileSync(this.fileSettingPath, JSON.stringify(this._setting), 'utf8');
    }
    syncMainWindow() {
        this.appController.mainWin.setBounds(this.mainWinBounds);
        this.appController.mainWin.on('resize', () => {
            const [width, height] = this.appController.mainWin.getSize();
            this.mainWinBounds = { ...this.mainWinBounds, width, height };
            this.save();
        });
        this.appController.mainWin.on('move', () => {
            const [x, y] = this.appController.mainWin.getPosition();
            this.mainWinBounds = { ...this.mainWinBounds, x, y };
            this.save();
        });
    }
}
