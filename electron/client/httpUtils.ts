import { IncomingMessage } from 'http';
const https = require('https');

const httpUtils = {
    request(options: { [key: string]: any },
        callback: (res: IncomingMessage) => void) {
        return https.request(options, callback);
    },
};

export default httpUtils;
