import path from 'node:path';
import electron from 'electron';
import url from 'node:url';

const browserUtils = {
    openExplorer(dir: string) {
        electron.shell.showItemInFolder(path.join(dir, ''));
    },
    copyToClipboard(str: string) {
        electron.clipboard.writeText(str);
    },
    urlPathToFileURL(urlPath: string) {
        return url.pathToFileURL(urlPath);
    },
};

export default browserUtils;
