
const httpUtils = {
    request(options: { [key: string]: any },
        callback: (res: any) => void) {
        const https = require('node:https');
        return https.request(options, callback);
    },
};

export default httpUtils;
