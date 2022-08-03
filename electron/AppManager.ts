import { BrowserWindow } from 'electron';
import SettingController from './SettingController';
const electron = require('electron');

export const isDev = process.env.NODE_ENV === 'development';

export default class AppManager {
    mainUrl = 'http://localhost:3000';
    mainHtmlFile = `${__dirname}/../dist/index.html`;
    presentHtmlFile = `${__dirname}/${isDev ? '../public' : '../dist'}/present.html`;
    preloadFile = `${__dirname}/preload.js`;
    presentScreenWidth: number = 0;
    presentScreenHeight: number = 0;
    previewResizeDim: {
        width: number,
        height: number,
    } = {
            width: 0,
            height: 0,
        };
    mainWin: BrowserWindow;
    presentWin: BrowserWindow | null = null;
    settingController: SettingController;
    _isShowingPS = false;
    constructor() {
        this.settingController = new SettingController(this);
        this.mainWin = this.createMainWindow();
        this.settingController.syncMainWindow();
        this.presentWin = null;
        this._isShowingPS = false;

        electron.app.on('activate', () => {
            if (electron.BrowserWindow.getAllWindows().length === 0) {
                this.mainWin = this.createMainWindow();
                this.settingController.syncMainWindow();
                this.createPresentWindow();
            }
        });

        this.createPresentWindow();
        this.capturePresentScreen();
    }
    get isShowingPS() {
        return this._isShowingPS;
    }
    set isShowingPS(b) {
        this._isShowingPS = b;
        if (b) {
            this.presentWin?.show();
        } else {
            this.presentWin?.close();
            this.createPresentWindow();
        }
    }
    createMainWindow() {
        const bounds = this.settingController.mainWinBounds;
        const mainWin = new electron.BrowserWindow({
            backgroundColor: '#000000',
            ...bounds,
            webPreferences: {
                webSecurity: !isDev,
                nodeIntegration: true,
                contextIsolation: false,
                preload: this.preloadFile,
            },
        });
        mainWin.on('closed', () => {
            process.exit(0);
        });
        if (isDev) {
            mainWin.loadURL(this.mainUrl);
        } else {
            mainWin.loadFile(this.mainHtmlFile);
        }
        // Open the DevTools.
        if (isDev) {
            mainWin.webContents.openDevTools();
        }
        return mainWin;
    }
    createPresentWindow() {
        const isWin32 = process.platform === 'win32';
        const isPresentCanFullScreen = isWin32;
        const presentWin = new electron.BrowserWindow({
            transparent: true,
            show: false,
            x: 0,
            y: 0,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        this.presentWin = presentWin;
        this.settingController.syncPresentWindow();
        if (isPresentCanFullScreen) {
            presentWin.setFullScreen(true);
        }

        presentWin.loadFile(this.presentHtmlFile);
    }
    async capturePresentScreen() {
        try {
            if (this.presentWin && !this.presentWin.isDestroyed()) {
                let img = await this.presentWin.webContents.capturePage({
                    x: 0, y: 0,
                    width: this.presentScreenWidth,
                    height: this.presentScreenHeight,
                });
                img = img.resize(this.previewResizeDim);
                const base64 = img.toJPEG(100).toString('base64');
                return base64 ? 'data:image/png;base64,' + base64 : '';
            }
        } catch (error) {
            console.log(error);
        }
    }
}
