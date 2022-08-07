import { BrowserWindow } from 'electron';
import {
    PresentType,
    AnyObjectType,
    channels,
} from './eventListener';
import { isDev } from './electronHelpers';

const url = 'http://localhost:3000';
const htmlFile = `${__dirname}/../dist/index.html`;
const presentPreloadFile = `${__dirname}/client/presentPreload.js`;
export default class ElectronPresentController {
    win: BrowserWindow;
    presentId: number;
    static _cache = new Map<string, ElectronPresentController>();
    constructor(presentId: number) {
        this.presentId = presentId;
        this.win = this.createPresentWindow();
    }
    createPresentWindow() {
        const isWin32 = process.platform === 'win32';
        const isPresentCanFullScreen = isWin32;
        const presentWin = new BrowserWindow({
            transparent: true,
            x: 0, y: 0,
            frame: false,
            webPreferences: {
                webSecurity: !isDev,
                nodeIntegration: true,
                contextIsolation: false,
                preload: presentPreloadFile,
            },
        });
        const query = `?presentId=${this.presentId}`;
        if (isDev) {
            presentWin.loadURL(url + query);
        } else {
            presentWin.loadFile(htmlFile + query);
        }
        if (isPresentCanFullScreen) {
            presentWin.setFullScreen(true);
        }
        return presentWin;
    }
    listenLoading() {
        return new Promise<void>((resolve) => {
            this.win.webContents.once('did-finish-load', () => {
                resolve();
            });
        });
    }
    hide() {
        this.win.close();
        ElectronPresentController._cache.delete(this.presentId.toString());
    }
    setDisplay(display: Electron.Display) {
        const bounds = display.bounds;
        this.win.setBounds(bounds);
    }
    sendData(channel: string, data: any) {
        this.win.webContents.send(channel, data);
    }
    sendMessage(type: PresentType, data: AnyObjectType) {
        this.win.webContents.send(
            channels.presentMessageChannel, {
            presentId: this.presentId,
            type,
            data,
        });
    }
    static getAllIds(): number[] {
        return Array.from(this._cache.keys()).map(key => {
            return +key;
        });
    }
    static createInstance(presentId: number) {
        const key = presentId.toString();
        if (!this._cache.has(key)) {
            const presentController = new ElectronPresentController(presentId);
            this._cache.set(key, presentController);
        }
        return this._cache.get(key) as ElectronPresentController;
    }
    static getInstance(presentId: number): ElectronPresentController | null {
        const key = presentId.toString();
        if (!this._cache.has(key)) {
            return null;
        }
        return this._cache.get(key) as ElectronPresentController;
    }
}
