import { presentEventListener } from '../event/PresentEventListener';
import { toastEventListener } from '../event/ToastEventListener';
import { genRandomString } from '../helper/helpers';
import appProvider from './appProvider';
import fullTextPresentHelper from '../full-text-present/previewingHelper';
import { pathJoin } from './fileHelper';
import { listenForData, listenOnceForData, sendData, sendSyncData } from './messagingHelpers';

export const isWindows = () => window.process.platform === 'win32';
export const isMac = () => window.process.platform === 'darwin';
export const isLinux = () => window.process.platform === 'linux';

export function openExplorer(dir: string) {
    appProvider.browserUtils.openExplorer(pathJoin(dir, ''));
}
export function openLink(link: string) {
    appProvider.browserUtils.openLink(link);
}
export function copyToClipboard(str: string) {
    appProvider.browserUtils.copyToClipboard(str);
    toastEventListener.showSimpleToast({
        title: 'Copy',
        message: 'Text has been copied to clip',
    });
    return true;
}

export function showWindow(b: boolean) {
    sendData(b ? 'main:app:show-present' : 'main:app:hide-present');
}
export function renderPresent(data: any) {
    sendData('main:app:present-eval-script', data);
}

listenForData('app:main:present-change-bible',
    (_event, isNext: boolean) => {
        presentEventListener.changeBible(isNext);
    });
listenForData('app:main:present-ctrl-scrolling',
    (_event, isUp: boolean) => {
        presentEventListener.presentCtrlScrolling(isUp);
    });
listenForData('app:main:hiding-present',
    (_event, _data: string) => {
        presentEventListener.fireHideEvent();
    });
listenForData('app:main:display-changed',
    (_event, _data: string) => {
        presentEventListener.displayChanged();
    });

export function capturePresentScreen() {
    return new Promise<string | null>((resolve) => {
        const replyEventName = `cps-${Date.now()}`;
        listenOnceForData(replyEventName, (_, data) => {
            resolve(data || null);
        });
        sendData('app:main:captured-preview', replyEventName);
    });
}

export function selectDirs() {
    return sendSyncData('main:app:select-dirs') as string[];
}
export function selectFiles(filters: {
    name: string, extensions: string[],
}[]) {
    return sendSyncData('main:app:select-files', filters) as string[];
}

export type RenderedType = {
    background?: boolean,
    foreground?: boolean,
    fullText?: boolean,
    alert?: boolean,
    show?: boolean,
};
export function getPresentRendered() {
    return new Promise<RenderedType>((resolve) => {
        const newDate = (new Date()).getTime();
        const returningEvent = `main:app:is-rendered-return-${newDate}`;
        listenOnceForData(returningEvent,
            (_event, data: RenderedType) => {
                resolve(data);
            });
        sendData('main:app:is-rendered', returningEvent);
    });
}
getPresentRendered().then((rendered) => {
    fullTextPresentHelper.isShowing = !!rendered.fullText;
});
export function getIsShowing() {
    return !!sendSyncData('main:app:is-presenting');
}
export function getUserWritablePath() {
    return sendSyncData('main:app:get-data-path');
}
export function sqlite3ReadValue(dbFilePath: string, table: string, key: string) {
    return new Promise<string | null>((resolve) => {
        const waitingEventName = `main:app:db-read-reply-${genRandomString(5)}`;
        listenOnceForData(waitingEventName,
            (_event, data: string | null) => {
                resolve(data);
            });
        sendData('main:app:db-read', {
            dbFilePath,
            table,
            key,
            waitingEventName,
        });
    });
}
