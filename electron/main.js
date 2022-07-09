'use strict';

const isDev = process.env.NODE_ENV === 'development';

const electron = require('electron');
const eventListener = require('./eventListener');
const settingManager = require('./settingManager');

const appManager = {
    showWinWidth: null,
    showWinHeight: null,
    previewResizeDim: null,
    mainWin: null,
    presentWin: null,
    capturedPresentScreenData: '',
    createMainWindow() {
        const bounds = settingManager.mainWinBounds;
        this.mainWin = new electron.BrowserWindow({
            backgroundColor: '#000000',
            ...bounds,
            webPreferences: {
                webSecurity: !isDev,
                nodeIntegration: true,
                contextIsolation: false,
                preload: `${__dirname}/preload.js`,
            },
        });
        settingManager.syncMainWindow(this);
        if (isDev) {
            this.mainWin.loadURL('http://localhost:3000');
        } else {
            this.mainWin.loadFile(`${__dirname}/../dist/index.html`);
        }
        // Open the DevTools.
        if (isDev) {
            this.mainWin.webContents.openDevTools();
        }
    },
    createPresentWindow() {
        const isWin32 = process.platform === 'win32';
        const isPresentCanFullScreen = isWin32;
        this.presentWin = new electron.BrowserWindow({
            transparent: true,
            show: false,
            x: 0,
            y: 0,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            parent: this.mainWin,
        });
        settingManager.syncPresentWindow(this);
        if (isPresentCanFullScreen) {
            this.presentWin?.setFullScreen(true);
        }
        const presentUrl = `${__dirname}/${isDev ? '../public' : '../dist'}/present.html`;
        this.presentWin?.loadFile(presentUrl);
        this.capturePresentScreen();
    },
    async capturePresentScreen() {
        if (this.presentWin === null) {
            this.capturedPresentScreenData = '';
            return;
        }
        try {
            let img = await this.presentWin?.webContents.capturePage({
                x: 0,
                y: 0,
                width: this.showWinWidth,
                height: this.showWinHeight,
            });
            img = img.resize(this.previewResizeDim);
            const base64 = img.toJPEG(100).toString('base64');
            const data = base64 ? 'data:image/png;base64,' + base64 : '';
            if (data && this.capturedPresentScreenData !== data) {
                this.capturedPresentScreenData = data;
                this.mainWin.webContents.send('app:main:captured-preview',
                    this.capturedPresentScreenData);
            }
            this.capturePresentScreen();
        } catch (error) {
            console.log(error);
            setTimeout(() => {
                this.capturePresentScreen();
            }, 3e3);
        }
    },
    init() {
        this.createMainWindow();
        this.createPresentWindow();
        electron.app.on('activate', () => {
            if (electron.BrowserWindow.getAllWindows().length === 0) {
                this.createMainWindow();
                this.createPresentWindow();
            }
        });
    },
};

electron.app.whenReady().then(() => {
    eventListener.initDisplayObserver(appManager);
    appManager.init();
});

eventListener.initMainScreen(appManager);
