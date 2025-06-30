import appProvider, { FontListType } from './appProvider';
import { showSimpleToast } from '../toast/toastHelpers';
import { handleError } from '../helper/errorHelpers';
import { showAppConfirm } from '../popup-widget/popupWidgetHelpers';
import { AnyObjectType, OptionalPromise } from '../helper/typeHelpers';

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

export interface ClipboardInf {
    clipboardSerialize(): OptionalPromise<string | null>;
}

function checkIsVersionOutdated(
    // 2025.06.25 vs 2025.06.26
    currentVersion: string,
    latestVersion: string,
) {
    const currentParts = currentVersion.split('.').map(Number);
    const latestParts = latestVersion.split('.').map(Number);

    for (
        let i = 0;
        i < Math.max(currentParts.length, latestParts.length);
        i++
    ) {
        const currentPart = currentParts[i] || 0;
        const latestPart = latestParts[i] || 0;

        if (currentPart < latestPart) {
            return true;
        } else if (currentPart > latestPart) {
            return false;
        }
    }
    return false; // Versions are equal
}

async function getDownloadTargetUrl() {
    const downloadInfo = await fetch(
        `${appProvider.appInfo.homepage}/download/info.json`,
        {
            method: 'GET',
            cache: 'no-cache',
        },
    )
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch update download info: ${response.statusText}`,
                );
            }
            return response.json();
        })
        .catch((error) => {
            console.error('Error fetching update download info:', error);
            return null;
        });
    if (downloadInfo === null) {
        return null;
    }
    const { systemUtils } = appProvider;
    const targetInfo =
        Object.entries(downloadInfo).find(([_key, item]: [string, any]) => {
            return (
                (systemUtils.isWindows && item.isWindows) ||
                (systemUtils.isMac && item.isMac) ||
                (systemUtils.isLinux && item.isLinux)
            );
        }) ?? null;
    if (targetInfo === null) {
        return null;
    }
    return `${appProvider.appInfo.homepage}/download/${targetInfo[0]}/info.json`;
}

export async function checkForUpdateSilently() {
    const url = await getDownloadTargetUrl();
    if (url === null) {
        return;
    }
    const updateData = await fetch(url, {
        method: 'GET',
        cache: 'no-cache',
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch update info: ${response.statusText}`,
                );
            }
            return response.json();
        })
        .catch((error) => {
            console.error('Error fetching update info:', error);
            return null;
        });
    if (updateData === null) {
        return;
    }
    try {
        const version = updateData.version as string;
        if (checkIsVersionOutdated(appProvider.appInfo.version, version)) {
            const isOk = await showAppConfirm(
                'Update Available',
                `A new version of the app is available: "${version}". ` +
                    'Would you like to check for update?',
            );
            if (isOk) {
                appProvider.messageUtils.sendData('main:app:go-download');
            }
        }
    } catch (error) {
        handleError(error);
    }
}
