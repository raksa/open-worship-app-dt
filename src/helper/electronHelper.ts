import { presentEventListener } from "../event/PresentEventListener";
import { toastEventListener } from "../event/ToastEventListener";
import { genRandomString } from "./helpers";
import electronProvider from "./electronProvider";
import fullTextPresentHelper from "../full-text-present/fullTextPresentHelper";

export const isWindows = () => window.process.platform === 'win32';
export const isMac = () => window.process.platform === 'darwin';
export const isLinux = () => window.process.platform === 'linux';

export const openExplorer = (dir: string) => {
    electronProvider.electron.shell.showItemInFolder(electronProvider.path.join(dir, ''));
};

export function showWindow(b: boolean) {
    electronProvider.ipcRenderer.send(b ? 'main:app:show-present' : 'main:app:hide-present');
}
export function renderPresent(data: any) {
    electronProvider.ipcRenderer.send('main:app:present-eval-script', data);
}

electronProvider.ipcRenderer.on('app:main:present-change-bible', (event: any, isNext: boolean) => {
    presentEventListener.changeBible(isNext);
});
electronProvider.ipcRenderer.on('app:main:present-ctrl-scrolling', (event: any, isUp: boolean) => {
    presentEventListener.presentCtrlScrolling(isUp);
});
electronProvider.ipcRenderer.on('app:main:captured-preview', (event: any, data: string) => {
    presentEventListener.fireDataEvent(data);
});
electronProvider.ipcRenderer.on('app:main:hiding-present', (event: any, data: string) => {
    presentEventListener.fireHideEvent();
});

export function copyToClipboard(str: string) {
    electronProvider.electron.clipboard.writeText(str);
    toastEventListener.showSimpleToast({
        title: 'Copy',
        message: 'Text has been copied to clip',
    });
    return true;
}

export function selectDirs() {
    const dirs = electronProvider.ipcRenderer.sendSync('main:app:select-dirs') as string[];
    return dirs;
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
        electronProvider.ipcRenderer.once(returningEvent, (event: any, data: RenderedType) => {
            resolve(data);
        });
        electronProvider.ipcRenderer.send('main:app:is-rendered', returningEvent)
    });
}
getPresentRendered().then((rendered) => {
    fullTextPresentHelper.isShowing = !!rendered.bible;
});
export function getIsShowing() {
    return !!electronProvider.ipcRenderer.sendSync('main:app:is-presenting');
}
export function getPresentScreenInfo() {
    return electronProvider.ipcRenderer.sendSync('main:app:present-sreen-info') as { width: number, height: number };
}
export function getUserWritablePath() {
    return electronProvider.ipcRenderer.sendSync('main:app:get-data-path');
}
export function sqlite3ReadValue(dbFilePath: string, table: string, key: string) {
    return new Promise<string | null>((resolve) => {
        const waitingEventName = `main:app:db-read-reply-${genRandomString(5)}`;
        electronProvider.ipcRenderer.once(waitingEventName, (event: any, data: string | null) => {
            resolve(data);
        });
        electronProvider.ipcRenderer.send('main:app:db-read', {
            dbFilePath,
            table,
            key,
            waitingEventName,
        });
    });
}
