import appProvider, { FontListType } from './appProvider';
import { showSimpleToast } from '../toast/toastHelpers';

export function getFontListByNodeFont() {
    appProvider.messageUtils.sendData('main:app:get-font-list');
    return appProvider.messageUtils.sendDataSync(
        'main:app:get-font-list',
    ) as FontListType | null;
}

export function genReturningEventName(eventName: string) {
    const newDate = (new Date()).getTime();
    return `${eventName}-return-${newDate}`;
}

export function showExplorer(dir: string) {
    appProvider.messageUtils.sendData('main:app:reveal-path', dir);
}

export function trashFile(filePath: string) {
    return new Promise<void>((resolve) => {
        const eventName = 'main:app:trash-path';
        const replyEventName = genReturningEventName(eventName);
        appProvider.messageUtils.listenOnceForData(replyEventName, () => {
            resolve();
        });
        appProvider.messageUtils.sendData(eventName, {
            path: filePath, replyEventName,
        });
    });
}

export function previewPdf(src: string) {
    appProvider.messageUtils.sendData(
        'main:app:preview-pdf', src,
    );
}

export function convertToPdf(
    filePath: string, outputDir: string, fileFullName: string,
) {
    return new Promise<void>((resolve) => {
        const eventName = 'main:app:convert-to-pdf';
        const replyEventName = genReturningEventName(eventName);
        appProvider.messageUtils.listenOnceForData(
            replyEventName, () => {
                resolve();
            },
        );
        appProvider.messageUtils.sendData(eventName, {
            replyEventName, filePath, outputDir, fileFullName,
        });
    });
}

export function tarExtract(filePath: string, outputDir: string) {
    return new Promise<void>((resolve) => {
        const eventName = 'main:app:tar-extract';
        const replyEventName = genReturningEventName(eventName);
        appProvider.messageUtils.listenOnceForData(
            replyEventName, () => {
                resolve();
            },
        );
        appProvider.messageUtils.sendData(eventName, {
            replyEventName, filePath, outputDir,
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
        const eventName = 'main:app:is-rendered';
        const replyEventName = genReturningEventName(eventName);
        appProvider.messageUtils.listenOnceForData(
            replyEventName, (_event, data: RenderedType) => {
                resolve(data);
            },
        );
        appProvider.messageUtils.sendData(
            'main:app:is-rendered', replyEventName,
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
export async function unlocking<T>(
    key: string, callback: () => (Promise<T> | T)
) {
    if (lockSet.has(key)) {
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
        return unlocking(key, callback);
    }
    lockSet.add(key);
    const data = await callback();
    lockSet.delete(key);
    return data;
}
