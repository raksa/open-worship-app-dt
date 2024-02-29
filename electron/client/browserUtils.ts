import electron from 'electron';
import url from 'node:url';

const browserUtils = {
    openExplorer(dir: string) {
        electron.shell.showItemInFolder(dir);
    },
    copyToClipboard(str: string) {
        electron.clipboard.writeText(str);
    },
    urlPathToFileURL(urlPath: string) {
        return url.pathToFileURL(urlPath);
    },
};

export default browserUtils;
