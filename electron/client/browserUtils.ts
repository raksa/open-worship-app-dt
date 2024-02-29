import electron from 'electron';
import url from 'node:url';
import { customScheme } from '../fsServe';

const browserUtils = {
    openExplorer(dir: string) {
        electron.shell.showItemInFolder(dir);
    },
    copyToClipboard(str: string) {
        electron.clipboard.writeText(str);
    },
    pathToFileURL(filePath: string) {
        let urlPath = url.pathToFileURL(filePath).toString();
        urlPath = urlPath.slice('file://'.length);
        return `${customScheme}://${urlPath}`;
    },
};

export default browserUtils;
