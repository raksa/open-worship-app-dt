import appProvider from './appProvider';
import { sendSyncData } from './messagingHelpers';

export function urlPathToFileURL(urlPath: string) {
    return appProvider.browserUtils.urlPathToFileURL(urlPath);
}

export function getAppInfo() {
    return sendSyncData('main:app:info') as {
        name: string,
        version: string,
        description: string,
    };
}

export function toBase64(str: string) {
    return Buffer.from(str, 'utf-8').toString('base64');
}
export function fromBase64(str: string) {
    return Buffer.from(str, 'base64').toString('utf-8');
}
