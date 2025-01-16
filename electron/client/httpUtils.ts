import https from 'node:https';

const httpUtils = {
    request(options: { [key: string]: any }, callback: (res: any) => void) {
        return https.request(options, callback);
    },
};

export default httpUtils;
