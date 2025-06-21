import appProvider, { FontListType } from './appProvider';
import { showSimpleToast } from '../toast/toastHelpers';
import { AnyObjectType } from '../helper/helpers';

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

export function electronSendAsync<T>(
    eventName: string,
    data: AnyObjectType = {},
) {
    return new Promise<T>((resolve, reject) => {
        const replyEventName = genReturningEventName(eventName);
        appProvider.messageUtils.listenOnceForData(
            replyEventName,
            (_event, data: T) => {
                if (data instanceof Error) {
                    return reject(data);
                }
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
    appProvider.systemUtils.copyToClipboard(str);
    showSimpleToast('Copy', 'Text has been copied to clip');
    return true;
}
