import ElectronAppController from './ElectronAppController';
import { isDev } from './electronHelpers';

export async function initReactExtension() {
    try {
        const title = 'Installing REACT extension';
        console.log(`\n${title}:--------START--------`);
        const {
            installExtension,
            REACT_DEVELOPER_TOOLS,
        } = await import('electron-extension-installer');
        await installExtension(REACT_DEVELOPER_TOOLS, {
            loadExtensionOptions: {
                allowFileAccess: true,
            },
        });
        console.log(`${title}:--------END--------\n`);
    } catch (error) {
        console.error(error);
    }
}

export async function initDevtools(appController: ElectronAppController) {
    if (!isDev) {
        return;
    }
    await initReactExtension();
    const win = appController.mainController.win;
    win.webContents.openDevTools();
}
