import { app, protocol } from 'electron';
import { customScheme, initCustomSchemeHandler } from './fsServe';

protocol.registerSchemesAsPrivileged([{
    scheme: customScheme,
    privileges: {
        bypassCSP: true,
        stream: true,
    },
}]);

import ElectronAppController from './ElectronAppController';
import { initApp, initPresent } from './electronEventListener';
import { initMenu } from './electronMenu';
import { initDevtools } from './devtools';
import { isDev } from './electronHelpers';

if (isDev) {
    app.commandLine.appendSwitch('ignore-certificate-errors');
}
app.whenReady().then(() => {
    initCustomSchemeHandler();
    const appController = ElectronAppController.getInstance();
    initApp(appController);
    initPresent(appController);
    initMenu(appController);
    initDevtools(appController);
});
