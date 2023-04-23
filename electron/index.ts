import ElectronAppController from './ElectronAppController';
import {
    initApp, initPresent,
} from './electronEventListener';
import { initMenu } from './electronMenu';
import { initExtensions } from './extensions';

const electron = require('electron');

electron.app.whenReady().then(async () => {
    await initExtensions();
    const appController = ElectronAppController.getInstance();
    initApp(appController);
    initPresent(appController);
    initMenu(appController);
});
