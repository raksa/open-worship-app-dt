import { presentEventListener } from '../event/PresentEventListener';
import { toastEventListener } from '../event/ToastEventListener';
import { genRandomString } from './helpers';
import appProvider from './appProvider';
import fullTextPresentHelper from '../full-text-present/fullTextPresentHelper';

export const isWindows = () => window.process.platform === 'win32';
export const isMac = () => window.process.platform === 'darwin';
export const isLinux = () => window.process.platform === 'linux';

export function openExplorer(dir: string) {
    appProvider.electron.shell.showItemInFolder(appProvider.path.join(dir, ''));
}

export function showWindow(b: boolean) {
    appProvider.ipcRenderer.send(b ? 'main:app:show-present' : 'main:app:hide-present');
}
export function renderPresent(data: any) {
    appProvider.ipcRenderer.send('main:app:present-eval-script', data);
}

appProvider.ipcRenderer.on('app:main:present-change-bible', (event: any, isNext: boolean) => {
    presentEventListener.changeBible(isNext);
});
appProvider.ipcRenderer.on('app:main:present-ctrl-scrolling', (event: any, isUp: boolean) => {
    presentEventListener.presentCtrlScrolling(isUp);
});
appProvider.ipcRenderer.on('app:main:captured-preview', (event: any, data: string) => {
    presentEventListener.fireDataEvent(data);
});
appProvider.ipcRenderer.on('app:main:hiding-present', (event: any, data: string) => {
    presentEventListener.fireHideEvent();
});
appProvider.ipcRenderer.on('app:main:display-changed', (event: any, data: string) => {
    presentEventListener.displayChanged();
});

export function copyToClipboard(str: string) {
    appProvider.electron.clipboard.writeText(str);
    toastEventListener.showSimpleToast({
        title: 'Copy',
        message: 'Text has been copied to clip',
    });
    return true;
}

export function selectDirs() {
    return appProvider.ipcRenderer.sendSync('main:app:select-dirs') as string[];
}

export type RenderedType = {
    background?: boolean,
    foreground?: boolean,
    bible?: boolean,
    alert?: boolean,
    show?: boolean,
};
export function getPresentRendered() {
    return new Promise((resolve: (r: RenderedType) => void, reject) => {
        const returningEvent = 'main:app:is-rendered-return-' + (new Date()).getTime();
        appProvider.ipcRenderer.once(returningEvent, (event: any, data: RenderedType) => {
            resolve(data);
        });
        appProvider.ipcRenderer.send('main:app:is-rendered', returningEvent);
    });
}
getPresentRendered().then((rendered) => {
    fullTextPresentHelper.isShowing = !!rendered.bible;
});
export function getIsShowing() {
    return !!appProvider.ipcRenderer.sendSync('main:app:is-presenting');
}
export function getPresentScreenInfo() {
    return appProvider.ipcRenderer.sendSync('main:app:present-sreen-info') as { width: number, height: number };
}
export function getUserWritablePath() {
    return appProvider.ipcRenderer.sendSync('main:app:get-data-path');
}
export function sqlite3ReadValue(dbFilePath: string, table: string, key: string) {
    return new Promise<string | null>((resolve) => {
        const waitingEventName = `main:app:db-read-reply-${genRandomString(5)}`;
        appProvider.ipcRenderer.once(waitingEventName, (event: any, data: string | null) => {
            resolve(data);
        });
        appProvider.ipcRenderer.send('main:app:db-read', {
            dbFilePath,
            table,
            key,
            waitingEventName,
        });
    });
}
