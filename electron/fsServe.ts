import fs from 'node:fs';
import path from 'node:path';
import { app, net, protocol } from 'electron';

const indexHtml = 'index.html';
export const scheme = 'http';
export const rootUrl = `${scheme}://owa`;

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

async function handler(dirPath: string, request: GlobalRequest) {
    const isLocal = request.url.startsWith(rootUrl);
    const urlPath = isLocal ?
        genFilePathUrl(dirPath, request.url) : request.url;
    return net.fetch(urlPath);
};

let registered = false;
export function registerScheme() {
    const registerHandler = () => {
        if (registered) {
            return;
        }
        registered = true;
        const dirPath = path.resolve(app.getAppPath(), 'dist');
        protocol.handle(scheme, handler.bind(null, dirPath));
    };
    return registerHandler;
};
