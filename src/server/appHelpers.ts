import appProvider, { FontListType } from './appProvider';
import { showSimpleToast } from '../toast/toastHelpers';
import { AnyObjectType } from '../helper/helpers';
import { OptionalPromise } from '../others/otherHelpers';
import { handleError } from '../helper/errorHelpers';
import { showAppConfirm } from '../popup-widget/popupWidgetHelpers';

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
export async function checkForUpdateSilently() {
    const { systemUtils } = appProvider;
    let urlPath = '';
    if (systemUtils.isWindows) {
        urlPath = systemUtils.is64System ? 'win' : 'win-ia32';
    } else if (systemUtils.isMac) {
        urlPath = systemUtils.isArm64 ? 'mac-arm64' : 'mac-x64';
    } else if (systemUtils.isLinux) {
        urlPath = systemUtils.isArm64 ? 'linux-arm64' : 'linux-x64';
    } else {
        throw new Error('Unsupported system');
    }
    const url = new URL(
        `${appProvider.appInfo.homepage}/download/${urlPath}/info.json`,
    );
    const updateData = await fetch(url.toString(), {
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
