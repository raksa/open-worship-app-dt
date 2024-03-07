import fs from 'node:fs';
import path from 'node:path';
import { app, net, protocol, session } from 'electron';

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

function handlerLocal(dirPath: string, url: string) {
    let urlPath = url;
    if (url.startsWith(rootUrl)) {
        urlPath = genFilePathUrl(dirPath, url);
    }
    return net.fetch(urlPath);
};

function checkIsSafe(url: string) {
    const { pathname } = new URL(url);
    // NB, this checks for paths that escape the bundle, e.g.
    // app://bundle/../../secret_file.txt
    const pathToServe = path.resolve(__dirname, pathname);
    const relativePath = path.relative(__dirname, pathToServe);
    const isSafe = (
        relativePath && !relativePath.startsWith('..') &&
        !path.isAbsolute(relativePath)
    );
    return isSafe;
}

export function initCustomSchemeHandler() {
    const dirPath = path.resolve(app.getAppPath(), 'dist');
    protocol.handle(customScheme, (request) => {
        const url = request.url;
        if (!checkIsSafe(url)) {
            return new Response('bad', {
                status: 400,
                headers: { 'content-type': 'text/html' },
            });
        }
        if (url.startsWith(rootUrl)) {
            return handlerLocal(dirPath, url);
        }
        const fileUrl = `file://${url.slice(rootUrlAccess.length)}`;
        return net.fetch(fileUrl);
    });

    const webRequest = session.defaultSession.webRequest;
    webRequest.onHeadersReceived(
        { urls: ['https://*/*'] }, (details, callback) => {
            if (details.responseHeaders) {
                details.responseHeaders['access-control-allow-headers'] = [
                    'x-api-key',
                ];
                details.responseHeaders['access-control-allow-origin'] = [
                    '*',
                ];
            }
            callback({ responseHeaders: details.responseHeaders });
        }
    );
};
