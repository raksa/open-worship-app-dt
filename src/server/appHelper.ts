import ToastEventListener from '../event/ToastEventListener';
import appProvider from './appProvider';
import { pathJoin } from './fileHelper';
import {
    defaultLocal,
    getCurrentLangAsync,
    getLangAsync,
} from '../lang';
import initCrypto from '../_owa-crypto';
import { getDownloadedBibleInfoList } from './bible-helpers/bibleHelpers';

export function openExplorer(dir: string) {
    appProvider.browserUtils.openExplorer(pathJoin(dir, ''));
}
export function copyToClipboard(str: string) {
    appProvider.browserUtils.copyToClipboard(str);
    ToastEventListener.showSimpleToast({
        title: 'Copy',
        message: 'Text has been copied to clip',
    });
    return true;
}

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

export async function initApp() {
    await initCrypto();
    await getCurrentLangAsync();
    await getLangAsync(defaultLocal);
    const downloadedBibleInfoList = await getDownloadedBibleInfoList();
    for (const bibleInfo of downloadedBibleInfoList || []) {
        await getLangAsync(bibleInfo.locale);
    }
}
