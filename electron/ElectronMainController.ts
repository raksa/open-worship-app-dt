import { BrowserWindow, shell } from 'electron';
import { channels, PresentMessageType } from './electronEventListener';
import { isDev } from './electronHelpers';
import { genRoutProps } from './helper';

const routeProps = genRoutProps('main');
export default class ElectronMainController {
    win: BrowserWindow;
    static _instance: ElectronMainController | null = null;
    constructor() {
        this.win = this.createMainWindow();
    }
    previewPdf(pdfFilePath: string) {
        const mainWin = this.win;
        const pdfWin = new BrowserWindow({
            parent: mainWin,
        });
        pdfWin.loadURL(pdfFilePath);
    }
    createMainWindow() {
        const win = new BrowserWindow({
            backgroundColor: '#000000',
            x: 0, y: 0,
            webPreferences: {
                webSecurity: !isDev,
                nodeIntegration: true,
                contextIsolation: false,
                preload: routeProps.preloadFile,
            },
        });
        win.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });
        win.on('closed', () => {
            process.exit(0);
        });
        if (isDev) {
            win.loadURL(routeProps.url);
        } else {
            win.loadFile(routeProps.htmlFile);
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
