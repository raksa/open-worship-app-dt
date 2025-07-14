import { ipcRenderer } from 'electron';
import { isWindows, toUnpackedPath, unlocking } from '../electronHelpers';
import { resolve } from 'node:path';

let timeOutId: NodeJS.Timeout | null = null;
let ytDlpWrap: any = null;
function scheduleRelease() {
    if (timeOutId !== null) {
        clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(() => {
        if (timeOutId === null) {
            return;
        }
        timeOutId = null;
        ytDlpWrap = null;
    }, 10e3); // 10 seconds timeout
}
async function getYTHelper() {
    return unlocking('getYTHelper', async () => {
        scheduleRelease();
        if (ytDlpWrap !== null) {
            return ytDlpWrap;
        }
        let modulePath = 'yt-dlp-wrap';
        const isPackaged = await ipcRenderer.invoke('get-is-packaged');
        if (isPackaged) {
            const appPath = await ipcRenderer.invoke('get-app-path');
            modulePath = toUnpackedPath(
                resolve(appPath, 'node_modules', modulePath),
            );
        }
        const YTDlpWrap = require(modulePath).default;
        const binaryPath = toUnpackedPath(
            resolve(
                __dirname,
                '../../bin-helper/yt/yt-dlp' + (isWindows ? '.exe' : ''),
            ),
        );
        ytDlpWrap = new YTDlpWrap(binaryPath);
        return ytDlpWrap;
    });
}

export const ytUtils = {
    getYTHelper,
};
