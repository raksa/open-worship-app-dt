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
            console.log(error);
            this.save();
        }
    }
    get allDisplay() {
        return electron.screen.getAllDisplays();
    }
    get primaryDisplay(){
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
            return this.primaryDisplay;
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
        return this.allDisplay.find((newDisplay) => newDisplay.id == id);
    }
    save() {
        fs.writeFileSync(fileSettingPath, JSON.stringify(this._setting), 'utf8');
    }
}

module.exports = new SettingManager();
