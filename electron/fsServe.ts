import fs from 'node:fs';
import path from 'node:path';
import {
    ProtocolRequest,
    ProtocolResponse, app, protocol,
} from 'electron';

function toFileFullPath(fileName: string) {
    try {
        const result = fs.statSync(fileName);
        if (result.isFile()) {
            return fileName;
        }
        if (result.isDirectory()) {
            return toFileFullPath(path.join(fileName, 'index.html'));
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

type CallbackTye = (response: (string) | (ProtocolResponse)) => void;
async function handler(
    directory: string, request: ProtocolRequest, callback: CallbackTye
) {
    console.log(request.url);
    const url = decodeURIComponent(new URL(request.url).pathname);
    const filePath = path.join(directory, url);
    const fileFullPath = toFileFullPath(filePath);
    callback(fileFullPath ? { path: fileFullPath } : { error: -6 });
};

export const scheme = 'owa';

export function serveProc() {
    protocol.registerSchemesAsPrivileged([{
        scheme,
        privileges: {
            standard: true,
            secure: true,
            allowServiceWorkers: true,
            supportFetchAPI: true,
            corsEnabled: true,
        },
    }]);
    const registerHandler = () => {
        const directory = path.resolve(app.getAppPath(), 'dist');
        protocol.registerFileProtocol(scheme, handler.bind(null, directory));
    };
    return registerHandler;
};
