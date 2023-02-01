import { IncomingMessage } from 'node:http';
const https = require('node:https');

const httpUtils = {
    request(options: { [key: string]: any },
        callback: (res: IncomingMessage) => void) {
        return https.request(options, callback);
    },
};

export default httpUtils;
