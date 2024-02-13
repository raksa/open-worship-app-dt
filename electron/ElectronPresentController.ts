import { BrowserWindow } from 'electron';
import {
    AnyObjectType, channels,
} from './electronEventListener';
import ElectronMainController from './ElectronMainController';
import { genRoutProps } from './protocolHelpers';

const routeProps = genRoutProps('present');
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
                webSecurity: false,
                nodeIntegration: true,
                contextIsolation: false,
                preload: routeProps.preloadFile,
            },
        });
        const query = `?presentId=${this.presentId}`;
        routeProps.loadURL(presentWin, query);
        if (isPresentCanFullScreen) {
            presentWin.setFullScreen(true);
        }
        presentWin.on('close', () => {
            this.destroyInstance();
        });
        return presentWin;
    }
    listenLoading() {
        return new Promise<void>((resolve) => {
            this.win.webContents.once('did-finish-load', () => {
                resolve();
            });
        });
    }
    destroyInstance() {
        ElectronMainController.getInstance().sendNotifyInvisibility(
            this.presentId);
        ElectronPresentController._cache.delete(this.presentId.toString());
    }
    close() {
        if (!this.win.isDestroyed()) {
            this.win.close();
        }
    }
    setDisplay(display: Electron.Display) {
        const bounds = display.bounds;
        this.win.setBounds(bounds);
    }
    sendData(channel: string, data: any) {
        this.win.webContents.send(channel, data);
    }
    sendMessage(type: string, data: AnyObjectType) {
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
            const presentController = new this(presentId);
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
