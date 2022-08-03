const path = require('path');
const electron = require('electron');
const url = require('url');

const browserUtils = {
    openExplorer(dir: string) {
        electron.shell.showItemInFolder(path.join(dir, ''));
    },
    openLink(link: string) {
        electron.shell.openExternal(link);
    },
    copyToClipboard(str: string) {
        electron.clipboard.writeText(str);
    },
    urlPathToFileURL(urlPath: string) {
        return url.pathToFileURL(urlPath);
    },
};

export default browserUtils;
