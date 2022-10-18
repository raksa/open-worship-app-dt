import { BrowserWindow } from 'electron';
import { channels, PresentMessageType } from './electronEventListener';
import { isDev } from './electronHelpers';

const url = 'http://localhost:3000';
const htmlFile = `${__dirname}/../../dist/index.html`;
const mainPreloadFile = `${__dirname}/client/mainPreload.js`;
export default class ElectronMainController {
    win: BrowserWindow;
    static _instance: ElectronMainController | null = null;
    constructor() {
        this.win = this.createMainWindow();
    }
    createMainWindow() {
        const win = new BrowserWindow({
            backgroundColor: '#000000',
            x: 0, y: 0,
            webPreferences: {
                webSecurity: !isDev,
                nodeIntegration: true,
                contextIsolation: false,
                preload: mainPreloadFile,
            },
        });
        win.on('closed', () => {
            process.exit(0);
        });
        if (isDev) {
            win.loadURL(url);
        } else {
            win.loadFile(htmlFile);
        }
        // Open the DevTools.
        if (isDev) {
            win.webContents.openDevTools();
        }
        return win;
    }
    close() {
        this.win.close();
        process.exit(0);
    }
    sendData(channel: string, data?: any) {
        this.win.webContents.send(channel, data);
    }
    sendMessage(message: PresentMessageType) {
        this.win.webContents.send(
            channels.presentMessageChannel, message);
    }
    changeBible(isNext: boolean) {
        this.sendData('app:main:change-bible', isNext);
    }
    ctrlScrolling(isUp: boolean) {
        this.sendData('app:main:ctrl-scrolling', isUp);
    }
    sendNotifyInvisibility(presentId: number) {
        this.sendMessage({
            presentId,
            type: 'visible',
            data: {
                isShowing: false,
            },
        });
    }
    static getInstance() {
        if (this._instance === null) {
            this._instance = new ElectronMainController();
        }
        return this._instance;
    }
}
