import { shell } from 'electron';
import url from 'node:url';
import { rootUrlAccess } from '../fsServe';
import { isSecured } from '../electronHelpers';

const browserUtils = {
    pathToFileURL(filePath: string) {
        let urlPath = url.pathToFileURL(filePath).toString();
        if (!isSecured) {
            return urlPath;
        }
        urlPath = urlPath.slice('file://'.length);
        return `${rootUrlAccess}://${urlPath}`;
    },
    openExternalURL(url: string) {
        shell.openExternal(url).catch((error: Error) => {
            console.error('Failed to open URL:', error);
        });
    },
};

export default browserUtils;
