import fs from 'node:fs';
import path from 'node:path';
import electron, { BrowserWindow } from 'electron';
import { htmlFiles } from './fsServe';

const settingObject: {
    mainWinBounds: Electron.Rectangle | null,
    appScreenDisplayId: number | null,
    mainHtmlPath: string,
} = {
    mainWinBounds: null,
    appScreenDisplayId: null,
    mainHtmlPath: htmlFiles.presenter,
};
export default class ElectronSettingController {
    constructor() {
        try {
            const str = fs.readFileSync(this.fileSettingPath, 'utf8');
            const json = JSON.parse(str);
            settingObject.mainWinBounds = json.mainWinBounds;
            settingObject.appScreenDisplayId = json.appScreenDisplayId;
            settingObject.mainHtmlPath = (
                json.mainHtmlPath ?? settingObject.mainHtmlPath
            );
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
        return settingObject.mainWinBounds ?? this.primaryDisplay.bounds;
    }

    set mainWinBounds(bounds) {
        settingObject.mainWinBounds = bounds;
        this.save();
    }

    resetMainBounds(win: BrowserWindow) {
        this.mainWinBounds = this.primaryDisplay.bounds;
        win.setBounds(this.mainWinBounds);
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
        fs.writeFileSync(
            this.fileSettingPath, JSON.stringify(settingObject), 'utf8',
        );
    }

    syncMainWindow(win: BrowserWindow) {
        win.setBounds(this.mainWinBounds);
        win.on('resize', () => {
            const [width, height] = win.getSize();
            this.mainWinBounds = { ...this.mainWinBounds, width, height };
            this.save();
        });
        win.on('move', () => {
            const [x, y] = win.getPosition();
            this.mainWinBounds = { ...this.mainWinBounds, x, y };
            this.save();
        });
    }

    get mainHtmlPath() {
        return settingObject.mainHtmlPath;
    }

    set mainHtmlPath(path: string) {
        settingObject.mainHtmlPath = path;
        this.save();
    }
}
