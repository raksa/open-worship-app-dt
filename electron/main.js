'use strict';

const isDev = process.env.NODE_ENV === 'development';

const electron = require('electron');
const eventListener = require('./eventListener');

const appManager = {
    externalDisplay: null,
    showWinWidth: null,
    showWinHeight: null,
    previewResizeDim: null,
    mainWin: null,
    presentWin: null,
    createMainWindow() {
        this.mainWin = new electron.BrowserWindow({
            width: 2500,
            height: 1200,
            backgroundColor: '#000000',
            webPreferences: {
                webSecurity: !isDev,
                nodeIntegration: true,
                contextIsolation: false,
                preload: `${__dirname}/preload.js`,
            },
        });
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
            show: false,
            x: this.externalDisplay.bounds.x,
            y: this.externalDisplay.bounds.y,
            width: this.externalDisplay.bounds.width,
            height: this.externalDisplay.bounds.height,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            parent: this.mainWin,
        });
        if (isPresentCanFullScreen) {
            this.presentWin.setFullScreen(true);
        }
        const presentUrl = `${__dirname}/${isDev ? '../public' : '../dist'}/present.html`;
        this.presentWin.loadFile(presentUrl);
    },
    init() {
        const displays = electron.screen.getAllDisplays();
        this.externalDisplay = displays.find((display) => {
            return display.bounds.x !== 0 || display.bounds.y !== 0;
        }) || displays[0];
        this.showWinWidth = this.externalDisplay.bounds.width;
        this.showWinHeight = this.externalDisplay.bounds.height;
        this.previewResizeDim = {
            width: this.showWinWidth / 3,
            height: this.showWinHeight / 3,
        };
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

electron.app.whenReady().then(() => appManager.init());

eventListener.initMainScreen(appManager);
