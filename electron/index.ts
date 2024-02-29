import ElectronAppController from './ElectronAppController';
import {
    initApp, initPresent,
} from './electronEventListener';
import { initMenu } from './electronMenu';
import { initDevtools } from './devtools';
import { app } from 'electron';
import { isDev } from './electronHelpers';

if (isDev) {
    app.commandLine.appendSwitch('ignore-certificate-errors');
}
app.whenReady().then(() => {
    const appController = ElectronAppController.getInstance();
    initApp(appController);
    initPresent(appController);
    initMenu(appController);
    initDevtools(appController);
});
