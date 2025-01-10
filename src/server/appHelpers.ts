import appProvider, { FontListType } from './appProvider';
import { showSimpleToast } from '../toast/toastHelpers';

export function getFontListByNodeFont() {
    appProvider.messageUtils.sendData('main:app:get-font-list');
    return appProvider.messageUtils.sendDataSync(
        'main:app:get-font-list',
    ) as FontListType | null;
}

export function genReturningEventName(eventName: string) {
    const newDate = new Date().getTime();
    return `${eventName}-return-${newDate}`;
}

export function electronSendAsync<T>(eventName: string, data: any = {}) {
    return new Promise<T>((resolve) => {
        const replyEventName = genReturningEventName(eventName);
        appProvider.messageUtils.listenOnceForData(
            replyEventName,
            (_event, data: T) => {
                resolve(data);
            },
        );
        appProvider.messageUtils.sendData(eventName, {
            ...data,
            replyEventName,
        });
    });
}

export function showExplorer(dir: string) {
    appProvider.messageUtils.sendData('main:app:reveal-path', dir);
}

export function trashFile(filePath: string) {
    return electronSendAsync<void>('main:app:trash-path', { path: filePath });
}

export function previewPdf(src: string) {
    appProvider.messageUtils.sendData('main:app:preview-pdf', src);
}

export function convertToPdf(officeFilePath: string, pdfFilePath: string) {
    return electronSendAsync<void>('main:app:convert-to-pdf', {
        officeFilePath,
        pdfFilePath,
    });
}

export function tarExtract(filePath: string, outputDir: string) {
    return electronSendAsync<void>('main:app:tar-extract', {
        filePath,
        outputDir,
    });
}

export function copyToClipboard(str: string) {
    appProvider.browserUtils.copyToClipboard(str);
    showSimpleToast('Copy', 'Text has been copied to clip');
    return true;
}

export function selectDirs() {
    return appProvider.messageUtils.sendDataSync(
        'main:app:select-dirs',
    ) as string[];
}
export function selectFiles(
    filters: {
        name: string;
        extensions: string[];
    }[],
) {
    return appProvider.messageUtils.sendDataSync(
        'main:app:select-files',
        filters,
    ) as string[];
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
    key: string,
    callback: () => Promise<T> | T,
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
