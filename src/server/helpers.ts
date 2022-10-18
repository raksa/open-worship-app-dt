import appProvider from './appProvider';

export function urlPathToFileURL(urlPath: string) {
    return appProvider.browserUtils.urlPathToFileURL(urlPath);
}

export function toBase64(str: string) {
    return Buffer.from(str, 'utf-8').toString('base64');
}
export function fromBase64(str: string) {
    return Buffer.from(str, 'base64').toString('utf-8');
}
