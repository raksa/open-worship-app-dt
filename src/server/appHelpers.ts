import appProvider, { FontListType } from './appProvider';
import { showSimpleToast } from '../toast/toastHelpers';

export function getFontListByNodeFont() {
    appProvider.messageUtils.sendData('main:app:get-font-list');
    return appProvider.messageUtils.sendDataSync(
        'main:app:get-font-list',
    ) as FontListType | null;
}

export function openExplorer(dir: string) {
    appProvider.messageUtils.sendData('main:app:reveal-path', dir);
}

export function trashFile(filePath: string) {
    return new Promise<void>((resolve) => {
        const replyEventName = 'app:main-' + Date.now();
        appProvider.messageUtils.listenOnceForData(replyEventName, () => {
            resolve();
        });
        appProvider.messageUtils.sendData('main:app:trash-path', {
            path: filePath, replyEventName,
        });
    });
}

export function copyToClipboard(str: string) {
    appProvider.browserUtils.copyToClipboard(str);
    showSimpleToast('Copy', 'Text has been copied to clip');
    return true;
}

export function selectDirs() {
    return (
        appProvider.messageUtils.sendDataSync(
            'main:app:select-dirs',
        ) as string[]
    );
}
export function selectFiles(filters: {
    name: string,
    extensions: string[],
}[]) {
    return (
        appProvider.messageUtils.sendDataSync(
            'main:app:select-files', filters,
        ) as string[]
    );
}

export type RenderedType = {
    background?: boolean,
    foreground?: boolean,
    fullText?: boolean,
    alert?: boolean,
    show?: boolean,
};
export function getScreenRendered() {
    return new Promise<RenderedType>((resolve) => {
        const newDate = (new Date()).getTime();
        const returningEvent = `main:app:is-rendered-return-${newDate}`;
        appProvider.messageUtils.listenOnceForData(
            returningEvent, (_event, data: RenderedType) => {
                resolve(data);
            },
        );
        appProvider.messageUtils.sendData(
            'main:app:is-rendered', returningEvent,
        );
    });
}
export function getUserWritablePath() {
    return appProvider.messageUtils.sendDataSync('main:app:get-data-path');
}
export function getDesktopPath() {
    return appProvider.messageUtils.sendDataSync('main:app:get-desktop-path');
}
export function getTempPath() {
    return appProvider.messageUtils.sendDataSync('main:app:get-temp-path');
}

const lockSet = new Set<string>();
export async function unlocking(
    key: string, callback: () => (Promise<void> | void)
) {
    if (lockSet.has(key)) {
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
        return unlocking(key, callback);
    }
    lockSet.add(key);
    await callback();
    lockSet.delete(key);
}
