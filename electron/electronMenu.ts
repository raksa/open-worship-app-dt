import ElectronAppController from './ElectronAppController';
import electron from 'electron';

export function initMenu(appController: ElectronAppController) {
    const isMac = process.platform === 'darwin';

    const template: any[] = [
        // { role: 'appMenu' }
        ...(isMac ? [{
            label: electron.app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
            ],
        }] : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [
                isMac ? { role: 'close' } : { role: 'quit' },
            ],
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                {
                    label: 'find (Ctrl + F)', click: () => {
                        appController.mainController.win.webContents
                            .sendInputEvent({
                                type: 'keyDown',
                                keyCode: 'F',
                                modifiers: ['control'],
                            });
                    },
                },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startSpeaking' },
                            { role: 'stopSpeaking' },
                        ],
                    },
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' },
                ]),
            ],
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
            ],
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' },
                ] : [
                    { role: 'close' },
                ]),
                {
                    label: 'Reset Position and Size',
                    click: () => {
                        appController.settingController.resetMainBounds(
                            appController.mainWin,
                        );
                    },
                },
            ],
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: () => {
                        electron.shell.openExternal(
                            'https://www.openworship.app/',
                        );
                    },
                },
            ],
        },
    ];

    const menu = electron.Menu.buildFromTemplate(template);
    electron.Menu.setApplicationMenu(menu);
}
