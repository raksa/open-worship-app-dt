import { clipboard } from 'electron';
import url from 'node:url';
import { rootUrlAccess } from '../fsServe';
import { isSecured } from '../electronHelpers';

const browserUtils = {
    copyToClipboard(str: string) {
        clipboard.writeText(str);
    },
    pathToFileURL(filePath: string) {
        let urlPath = url.pathToFileURL(filePath).toString();
        if (!isSecured) {
            return urlPath;
        }
        urlPath = urlPath.slice('file://'.length);
        return `${rootUrlAccess}://${urlPath}`;
    },
};

export default browserUtils;
