import fs from 'node:fs';
import path from 'node:path';
import { app, net, protocol } from 'electron';

const indexHtml = 'index.html';
export const customScheme = 'owa';
export const schemePrivileges = {
    standard: true,
    secure: true,
    allowServiceWorkers: true,
    supportFetchAPI: true,
    corsEnabled: true,
    stream: true,
};
export const rootUrl = `${customScheme}://local`;
export const rootUrlAccess = `${customScheme}://access`;

function toFileFullPath(filePath: string) {
    try {
        const result = fs.statSync(filePath);
        if (result.isFile()) {
            return filePath;
        }
    } catch (_) { }
    return null;
}

function genFilePathUrl(dirPath: string, url: string) {
    url = decodeURIComponent((new URL(url)).pathname);
    let filePath = path.join(dirPath, url);
    filePath = toFileFullPath(filePath) ?? path.join(dirPath, indexHtml);
    return `file://${filePath}`;
}

function handler(dirPath: string, request: GlobalRequest) {
    const url = request.url;
    let urlPath = url;
    if (url.startsWith(rootUrl)) {
        urlPath = genFilePathUrl(dirPath, url);
    }
    return net.fetch(urlPath);
};

export function initCustomSchemeHandler() {
    const dirPath = path.resolve(app.getAppPath(), 'dist');
    protocol.handle(customScheme, function (request) {
        const url = request.url;
        if (url.startsWith(rootUrl)) {
            return handler(dirPath, request);
        }
        const fileUrl = `file://${url.slice(rootUrlAccess.length)}`;
        return net.fetch(fileUrl);
    });
};
