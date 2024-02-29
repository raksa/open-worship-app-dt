import fs from 'node:fs';
import path from 'node:path';
import { app, net, protocol } from 'electron';

const indexHtml = 'index.html';
export const customScheme = 'owa-access';
export const appScheme = 'app';
export const rootUrl = `${appScheme}://owa`;

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
    protocol.handle(customScheme, function (request) {
        return net.fetch('file://' + request.url.slice(
            `${customScheme}://`.length),
        );
    });
    const dirPath = path.resolve(app.getAppPath(), 'dist');
    protocol.handle(appScheme, handler.bind(null, dirPath));
};
