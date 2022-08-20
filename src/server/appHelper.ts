import { presentEventListener } from '../event/PresentEventListener';
import ToastEventListener from '../event/ToastEventListener';
import { genRandomString } from '../helper/helpers';
import appProvider from './appProvider';
import fullTextPresentHelper from '../_present/fullTextPresentHelper';
import { pathJoin } from './fileHelper';
import bibleHelper from './bible-helpers/bibleHelpers';
import { initBibleInfo } from './bible-helpers/helpers1';
import {
    defaultLocal,
    getCurrentLangAsync,
    getLangAsync,
    LocalType,
} from '../lang';

export function openExplorer(dir: string) {
    appProvider.browserUtils.openExplorer(pathJoin(dir, ''));
}
export function openLink(link: string) {
    appProvider.browserUtils.openLink(link);
}
export function copyToClipboard(str: string) {
    appProvider.browserUtils.copyToClipboard(str);
    ToastEventListener.showSimpleToast({
        title: 'Copy',
        message: 'Text has been copied to clip',
    });
    return true;
}

appProvider.messageUtils.listenForData('app:main:change-bible',
    (_event, isNext: boolean) => {
        presentEventListener.changeBible(isNext);
    });
appProvider.messageUtils.listenForData('app:main:ctrl-scrolling',
    (_event, isUp: boolean) => {
        presentEventListener.presentCtrlScrolling(isUp);
    });

export function selectDirs() {
    return appProvider.messageUtils.
        sendDataSync('main:app:select-dirs') as string[];
}
export function selectFiles(filters: {
    name: string,
    extensions: string[],
}[]) {
    return appProvider.messageUtils.
        sendDataSync('main:app:select-files',
            filters) as string[];
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
        appProvider.messageUtils.
            listenOnceForData(returningEvent,
                (_event, data: RenderedType) => {
                    resolve(data);
                });
        appProvider.messageUtils.
            sendData('main:app:is-rendered', returningEvent);
    });
}
export function getUserWritablePath() {
    return appProvider.messageUtils.
        sendDataSync('main:app:get-data-path');
}
export function sqlite3ReadValue(dbFilePath: string, table: string, key: string) {
    return new Promise<string | null>((resolve) => {
        const waitingEventName = `main:app:db-read-reply-${genRandomString(5)}`;
        appProvider.messageUtils.
            listenOnceForData(waitingEventName,
                (_event, data: string | null) => {
                    resolve(data);
                });
        appProvider.messageUtils.
            sendData('main:app:db-read', {
                dbFilePath,
                table,
                key,
                waitingEventName,
            });
    });
}

export async function initApp() {
    await getCurrentLangAsync();
    await getLangAsync(defaultLocal);
    // Showing
    fullTextPresentHelper.loadSetting();
    // Bibles
    if (!bibleHelper.getBibleList().length) {
        await bibleHelper.getBibleListOnline();
    }
    const list = await bibleHelper.getDownloadedBibleList();
    for (const bibleName of list) {
        const info = await initBibleInfo(bibleName);
        if (info !== null) {
            const isExist = await bibleHelper.checkExist(bibleName);
            if (isExist) {
                await getLangAsync(info.locale as LocalType);
            }
        }
    }


}
