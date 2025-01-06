import ElectronAppController from './ElectronAppController.js';
import { isDev } from './electronHelpers.js';

export async function initDevtools(appController: ElectronAppController) {
    if (!isDev) {
        return;
    }
    const win = appController.mainController.win;
    win.webContents.openDevTools();
}
