import fs from 'node:fs';
import path from 'node:path';
import { BrowserWindow, app, net, protocol } from 'electron';

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

const mapper = {
    '.owb': 'application/owb',
    '.apng': 'image/apng',
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.jpg"': 'image/jpeg',
    '.jpeg"': 'image/jpeg',
    '.jfif"': 'image/jpeg',
    '.pjpeg"': 'image/jpeg',
    '.pjp': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.owl': 'application/owl',
    '.owp': 'application/owp',
    '.ows': 'application/ows',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.jpg': 'image/jpg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mp3',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'appliaction/vnd.ms-fontobject',
    '.ttf': 'aplication/font-sfnt',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.wasm': 'application/wasm',
};
function contentType(filePath: string) {
    const extname = path.extname(filePath);
    return mapper[extname] ?? 'text/html';
}

async function handler(dirPath: string, request: GlobalRequest) {
    if (!request.url.startsWith(rootUrl)) {
        return net.fetch(request);
    }
    const url = decodeURIComponent((new URL(request.url)).pathname);
    let filePath = path.join(dirPath, url);
    const fallback = path.join(dirPath, indexHtml);
    filePath = toFileFullPath(filePath) ?? fallback;
    const isFallback = filePath === fallback;
    return new Response(fs.readFileSync(filePath), {
        headers: { 'content-type': contentType(filePath) },
    });
};

export function registerScheme() {
    const registerHandler = () => {
        const directory = path.resolve(app.getAppPath(), 'dist');
        protocol.handle(scheme, handler.bind(null, directory));
    };
    return registerHandler;
};
