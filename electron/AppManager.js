const isDev = process.env.NODE_ENV === 'development';

const electron = require('electron');
const SettingController = require('./SettingController');

class AppManager {
    constructor() {
        this.presentScreenWidth = null;
        this.presentScreenHeight = null;
        this.previewResizeDim = null;
        this.mainWin = null;
        this.presentWin = null;
        this.capturedPresentScreenData = '';
        this.settingController = new SettingController(this);
        this._isShowingPS = false;

        electron.app.on('activate', () => {
            if (electron.BrowserWindow.getAllWindows().length === 0) {
                this.createMainWindow();
                this.createPresentWindow();
            }
        });

        this.createMainWindow();
        this.createPresentWindow();
        this.capturePresentScreen();
    }
    get isShowingPS() {
        return this._isShowingPS;
    }
    set isShowingPS(b) {
        this._isShowingPS = b;
        if (b) {
            this.presentWin.show();
        } else {
            this.presentWin.close();
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
                preload: `${__dirname}/preload.js`,
            },
        });
        this.mainWin = mainWin;
        mainWin.on('closed', _ => {
            process.exit(0);
        });
        this.settingController.syncMainWindow();
        if (isDev) {
            mainWin.loadURL('http://localhost:3000');
        } else {
            mainWin.loadFile(`${__dirname}/../dist/index.html`);
        }
        // Open the DevTools.
        if (isDev) {
            mainWin.webContents.openDevTools();
        }
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
        const presentUrl = `${__dirname}/${isDev ? '../public' : '../dist'}/present.html`;
        presentWin.loadFile(presentUrl);
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
                const data = base64 ? 'data:image/png;base64,' + base64 : '';
                if (data && this.capturedPresentScreenData !== data) {
                    this.capturedPresentScreenData = data;
                    this.mainWin.webContents.send('app:main:captured-preview',
                        this.capturedPresentScreenData);
                } else {
                    setTimeout(() => {
                        this.capturedPresentScreenData = '';
                    }, 3e3);
                }
            }
        } catch (error) {
            console.log(error);
            setTimeout(() => {
                this.capturePresentScreen = '';
            }, 3e3);
        } finally {
            this.capturePresentScreen();
        }
    }
}

module.exports = AppManager;

