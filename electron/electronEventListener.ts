import ElectronAppController from './ElectronAppController';
import ElectronScreenController from './ElectronScreenController';
import electron, { shell } from 'electron';
import fontList from 'font-list';

const { dialog, ipcMain, app } = electron;
const cache: { [key: string]: any } = {
    fontsMap: null,
};

export type AnyObjectType = {
    [key: string]: any;
};

export type ScreenMessageType = {
    screenId: number,
    type: string,
    data: AnyObjectType,
};
type ShowScreenDataType = {
    screenId: number,
    displayId: number,
    replyEventName: string,
};

export const channels = {
    screenMessageChannel: 'app:screen:message',
};

export function initApp(appController: ElectronAppController) {
    ipcMain.on('main:app:get-data-path', (event) => {
        event.returnValue = app.getPath('userData');
    });
    ipcMain.on('main:app:get-desktop-path', (event) => {
        event.returnValue = app.getPath('desktop');
    });
    ipcMain.on('main:app:get-temp-path', (event) => {
        event.returnValue = app.getPath('temp');
    });
    ipcMain.on('main:app:select-dirs', async (event) => {
        const result = await dialog.showOpenDialog(appController.mainWin, {
            properties: ['openDirectory'],
        });
        event.returnValue = result.filePaths;
    });
    ipcMain.on('main:app:select-files', async (event, filters) => {
        const result = await dialog.showOpenDialog(appController.mainWin, {
            properties: ['openFile', 'multiSelections'],
            filters,
        });
        event.returnValue = result.filePaths;
    });

}
export function initScreen(appController: ElectronAppController) {
    ipcMain.on('main:app:get-displays', (event) => {
        event.returnValue = {
            primaryDisplay: appController.settingController.primaryDisplay,
            displays: appController.settingController.allDisplays,
        };
    });
    ipcMain.on('main:app:get-screens', (event) => {
        event.returnValue = ElectronScreenController.getAllIds();
    });
    // TODO: use shareProps.mainWin.on or shareProps.screenWin.on
    ipcMain.on('main:app:show-screen', (event, data: ShowScreenDataType) => {
        const screenController = (
            ElectronScreenController.createInstance(data.screenId)
        );
        const display = (
            appController.settingController.getDisplayById(data.displayId)
        );
        if (display !== undefined) {
            screenController.listenLoading().then(() => {
                appController.mainController.sendData(data.replyEventName);
            });
            screenController.setDisplay(display);
            appController.mainWin.focus();
        }
        screenController.win.on('close', () => {
            screenController.destroyInstance();
            appController.mainController.sendNotifyInvisibility(data.screenId);
        });
        event.returnValue = Promise.resolve('hello');
    });
    ipcMain.on('app:hide-screen', (_, screenId: number) => {
        const screenController = ElectronScreenController
            .getInstance(screenId);
        if (screenController === null) {
            return;
        }
        screenController.close();
        screenController.destroyInstance();
    });
    ipcMain.on('main:app:set-screen-display', (event, data: {
        screenId: number,
        displayId: number,
    }) => {
        const display = (
            appController.settingController.getDisplayById(data.displayId)
        );
        const screenController = (
            ElectronScreenController.getInstance(data.screenId)
        );
        if (display !== undefined && screenController !== null) {
            screenController.setDisplay(display);
            event.returnValue = display;
        } else {
            event.returnValue = null;
        }
    });
    ipcMain.on(channels.screenMessageChannel,
        async (event, { type, screenId, isScreen, data }: ScreenMessageType & {
            isScreen: boolean,
        }) => {
            if (isScreen) {
                appController.mainController.sendMessage({
                    screenId: screenId,
                    type,
                    data,
                });
            } else {
                const screenController = (
                    ElectronScreenController.getInstance(screenId)
                );
                if (screenController !== null) {
                    screenController.sendMessage(type, data);
                }
            }
            event.returnValue = true;
        });
    ipcMain.on('screen:app:change-bible', (_, isNext) => {
        appController.mainController.changeBible(isNext);
    });
    ipcMain.on('screen:app:ctrl-scrolling', (_, isUp) => {
        appController.mainController.ctrlScrolling(isUp);
    });
    ipcMain.on('app:preview-pdf', (_, pdfFilePath: string) => {
        appController.mainController.previewPdf(pdfFilePath);
    });

    ipcMain.on('main:app:get-font-list', async (event) => {
        if (cache.fontsMap !== null) {
            event.returnValue = cache.fontsMap;
        }
        try {
            const fonts = await fontList.getFonts({ disableQuoting: true });
            const fontsMap = Object.fromEntries(fonts.map((fontName) => {
                return [fontName, []];
            }));
            event.returnValue = fontsMap;
            cache.fontsMap = fontsMap;
        } catch (error) {
            console.log(error);
            event.returnValue = null;
        }
    });

    ipcMain.on('main:app:reveal-path', (_, path: string) => {
        shell.showItemInFolder(path);
    });

    ipcMain.on('main:app:trash-path', (_, data: {
        path: string,
        replyEventName: string
    }) => {
        shell.trashItem(data.path).then(() => {
            appController.mainController.sendData(data.replyEventName);
        });
    });

    ipcMain.on('main:app:open-search', () => {
        appController.finderController.open(appController.mainWin);
    });

    ipcMain.on('finder:app:close-search', () => {
        appController.finderController.close();
    });

    const mainWinWebContents = appController.mainWin.webContents;
    ipcMain.on('finder:app:search-in-page',
        (event, searchText: string, options: {
            forward?: boolean;
            findNext?: boolean;
            matchCase?: boolean;
        } = {}) => {
            event.returnValue = mainWinWebContents.findInPage(
                searchText, options,
            );
        },
    );
    ipcMain.on('finder:app:stop-search-in-page', (
        _, action: 'clearSelection' | 'keepSelection' | 'activateSelection',
    ) => {
        mainWinWebContents.stopFindInPage(action);
    });
}
