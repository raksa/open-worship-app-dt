import { BrowserWindow } from 'electron';
import { isDev } from './helpers';

const url = 'http://localhost:3000';
const htmlFile = `${__dirname}/../dist/index.html`;
const presentPreloadFile = `${__dirname}/client/presentPreload.js`;
export default class PresentManager {
    win: BrowserWindow;
    id: number;
    static _cache: Map<string, PresentManager> = new Map();
    constructor(id: number) {
        this.id = id;
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
                nodeIntegration: true,
                contextIsolation: false,
                preload: presentPreloadFile,
            },
        });
        if (isDev) {
            presentWin.loadURL(url);
        } else {
            presentWin.loadFile(htmlFile);
        }
        this.win = presentWin;
        if (isPresentCanFullScreen) {
            presentWin.setFullScreen(true);
        }
        return presentWin;
    }
    hide() {
        this.win.close();
        PresentManager._cache.delete(this.win.id.toString());
    }
    setDisplay(display: Electron.Display) {
        const bounds = display.bounds;
        bounds.height -= bounds.y;
        this.win.setBounds(bounds);
    }
    sendData(channel: string, data: any) {
        this.win.webContents.send(channel, data);
    }
    sendMessage(data: any) {
        this.sendData('app:present:message', data);
    }
    static getAllIds(): number[] {
        return Array.from(this._cache.keys()).map(key => {
            return +key;
        });
    }
    static createInstance(presentId: number) {
        const key = presentId.toString();
        if (!this._cache.has(key)) {
            const presentManager = new PresentManager(presentId);
            this._cache.set(key, presentManager);
        }
        return this._cache.get(key) as PresentManager;
    }
    static getInstance(presentId: number): PresentManager | null {
        const key = presentId.toString();
        if (!this._cache.has(key)) {
            return null;
        }
        return this._cache.get(key) as PresentManager;
    }
}
