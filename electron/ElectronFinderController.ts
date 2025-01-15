import { BrowserWindow } from 'electron';

import { genRoutProps } from './protocolHelpers';
import { htmlFiles } from './fsServe';
import { isSecured } from './electronHelpers';

const routeProps = genRoutProps(htmlFiles.finder);
export default class ElectronFinderController {
    win: BrowserWindow | null = null;
    mainWin: BrowserWindow | null = null;
    createFinderWindow(mainWin: BrowserWindow) {
        const win = new BrowserWindow({
            backgroundColor: '#000000',
            x: 0, y: 0,
            width: 350, height: 100,
            webPreferences: {
                webSecurity: isSecured,
                nodeIntegration: true,
                contextIsolation: false,
                preload: routeProps.preloadFilePath,
            },
            parent: mainWin,
        });
        routeProps.loadURL(win);
        return win;
    }
    open(mainWin: BrowserWindow) {
        if (this.win === null) {
            this.mainWin = mainWin;
            this.win = this.createFinderWindow(mainWin);
            this.win.on('closed', () => {
                this.close();
            });
        } else {
            this.win.show();
        }
    }
    close() {
        this.mainWin?.webContents.stopFindInPage('clearSelection');
        if (!this.win?.isDestroyed()) {
            this.win?.close();
        }
        this.mainWin = null;
        this.win = null;
    }
}
