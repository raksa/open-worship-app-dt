'use strict';

const fs = require('fs');
const path = require('path');
const electron = require('electron');

// TODO: screen size and position
const fileSettingPath = path.join(electron.app.getPath('userData'), 'setting.json');
class SettingManager {
    _setting = {};
    constructor() {
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
    get mainWinX() {
        return this._setting.mainWinX || (this.mainDisplay.bounds.x + 10);
    }
    get mainWinY() {
        return this._setting.mainWinY || (this.mainDisplay.bounds.y + 10);
    }
    get mainWinWidth() {
        return this._setting.mainWinWidth || 2500;
    }
    get mainWinHeight() {
        return this._setting.mainWinHeight || 2500;
    }
    get mainWinBounds() {
        return {
            x: this.mainWinX,
            y: this.mainWinY,
            width: this.mainWinWidth,
            height: this.mainWinHeight,
        };
    }
    get allDisplays() {
        return electron.screen.getAllDisplays();
    }
    get primaryDisplay() {
        return electron.screen.getPrimaryDisplay();
    }
    get mainDisplay() {
        if (!this._setting.appMainDisplayId) {
            return this.primaryDisplay;
        }
        return this.getDisplayById(this._setting.appMainDisplayId) || this.primaryDisplay;
    }
    set mainDisplayId(id) {
        const display = this.getDisplayById(id);
        if (display) {
            this._setting.appMainDisplayId = display.id;
            this.save();
        } else {
            throw new Error(`Screen with id:${id} is not found`);
        }
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
    syncMainWindow(appManager) {
        if (appManager.mainWin !== null) {
            appManager.mainWin.on('resize', () => {
                const [width, height] = appManager.mainWin.getSize();
                this._setting.mainWinWidth = width;
                this._setting.mainWinHeight = height;
                this.save();
            });
            appManager.mainWin.on('move', () => {
                const [x, y] = appManager.mainWin.getPosition();
                this._setting.mainWinX = x;
                this._setting.mainWinY = y;
                this.save();
            });
        }
    }
    syncPresentWindow(appManager) {
        const bounds = this.presentDisplay.bounds;
        appManager.showWinWidth = bounds.width;
        appManager.showWinHeight = bounds.height;
        appManager.previewResizeDim = {
            width: appManager.showWinWidth / 3,
            height: appManager.showWinHeight / 3,
        };
        if (appManager.presentWin !== null) {
            appManager.presentWin?.setBounds(bounds);
        }
    }
}

module.exports = new SettingManager();
