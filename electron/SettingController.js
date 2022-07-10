const fs = require('fs');
const path = require('path');
const electron = require('electron');

const fileSettingPath = path.join(electron.app.getPath('userData'), 'setting.json');
class SettingController {
    _setting = {};
    constructor(appManager) {
        this.appManager = appManager;
        try {
            const str = fs.readFileSync(fileSettingPath, 'utf8');
            this._setting = JSON.parse(str);
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.save();
            } else {
                console.log(error);
            }
        }
    }
    get presentWidth() {
        return this.presentDisplay.bounds.width;
    }
    get presentHeight() {
        return this.presentDisplay.bounds.height;
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
        this.appManager.mainWin.setBounds(this.mainWinBounds);
    }
    get allDisplays() {
        return electron.screen.getAllDisplays();
    }
    get primaryDisplay() {
        return electron.screen.getPrimaryDisplay();
    }
    get presentDisplay() {
        if (!this._setting.appPresentDisplayId) {
            return this.allDisplays.find((display) => {
                return display.bounds.x !== 0 || display.bounds.y !== 0;
            }) || this.allDisplays[0];
        }
        return this.getDisplayById(this._setting.appPresentDisplayId) || this.primaryDisplay;
    }
    set presentDisplayId(id) {
        const display = this.getDisplayById(id);
        if (display) {
            this._setting.appPresentDisplayId = display.id;
            this.save();
        } else {
            throw new Error(`Screen with id:${id} is not found`);
        }
    }
    getDisplayById(id) {
        return this.allDisplays.find((newDisplay) => newDisplay.id == id);
    }
    save() {
        fs.writeFileSync(fileSettingPath, JSON.stringify(this._setting), 'utf8');
    }
    syncMainWindow() {
        this.appManager.mainWin.setBounds(this.mainWinBounds);
        this.appManager.mainWin.on('resize', () => {
            const [width, height] = this.appManager.mainWin.getSize();
            this.mainWinBounds = { ...this.mainWinBounds, width, height };
            this.save();
        });
        this.appManager.mainWin.on('move', () => {
            const [x, y] = this.appManager.mainWin.getPosition();
            this.mainWinBounds = { ...this.mainWinBounds, x, y };
            this.save();
        });
    }
    syncPresentWindow() {
        const bounds = this.presentDisplay.bounds;
        this.appManager.presentScreenWidth = bounds.width;
        this.appManager.presentScreenHeight = bounds.height;
        this.appManager.previewResizeDim = {
            width: this.appManager.presentScreenWidth / 3,
            height: this.appManager.presentScreenHeight / 3,
        };
        bounds.height -= bounds.y;
        this.appManager.presentWin.setBounds(bounds);
        if (this.appManager.isShowingPS) {
            this.appManager.presentWin.show();
        }
    }
}

module.exports = SettingController;
