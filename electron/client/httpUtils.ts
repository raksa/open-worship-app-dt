import { IncomingMessage } from 'http';
const https = require('https');
const electron = require('electron');

const ipcRenderer = electron.ipcRenderer;

const httpUtils = {
    request(options: { [key: string]: any },
        callback: (res: IncomingMessage) => void) {
        const httpsInfo = ipcRenderer.sendSync('app:app:https-credential');
        options.hostname = httpsInfo.apiUrl.substring(8);
        options.headers = {
            ...(options.headers || {}),
            'x-api-key': httpsInfo.apiKey,
        };
        return https.request(options, callback);
    },
};

export default httpUtils;
