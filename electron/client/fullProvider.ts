import browserUtils from './browserUtils';
import cryptoUtils from './cryptoUtils';
import fileUtils from './fileUtils';
import httpUtils from './httpUtils';
import messageUtils from './messageUtils';
import systemUtils from './systemUtils';
import pathUtils from './pathUtils';
import fontUtils from './fontUtils';
import appUtils from './appUtils';
import databaseUtils from './databaseUtils';

import appInfo from '../../package.json';
import { resolve } from 'node:path';
import { toUnpackedPath, unlocking } from '../electronHelpers';
import { ipcRenderer } from 'electron';

function toVersionNumber(version: string) {
    const [major, minor, patch] = version
        .split('.')
        .map((str) => parseInt(str, 10));
    return major * 10000 + minor * 100 + patch;
}

let timeOutId: NodeJS.Timeout | null = null;
let powerPoint: any = null;
function scheduleRelease() {
    if (timeOutId !== null) {
        clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(() => {
        if (timeOutId === null) {
            return;
        }
        timeOutId = null;
        powerPoint = null;
    }, 10e3); // 10 seconds timeout
}
async function getPowerPointHelper(dotNetRoot?: string) {
    return unlocking('getPowerPointHelper' + dotNetRoot, async () => {
        try {
            scheduleRelease();
            if (powerPoint !== null) {
                return powerPoint.Helper;
            }
            if (dotNetRoot) {
                process.env.DOTNET_ROOT = dotNetRoot;
            } else {
                process.env.DOTNET_ROOT = toUnpackedPath(
                    resolve(__dirname, '../../powerpoint-helper/bin'),
                );
            }
            let modulePath = 'node-api-dotnet/net8.0';
            const isPackaged = await ipcRenderer.invoke('get-is-packaged');
            if (isPackaged) {
                const appPath = await ipcRenderer.invoke('get-app-path');
                modulePath = toUnpackedPath(
                    resolve(appPath, 'node_modules', modulePath),
                );
            }
            const dotnet = require(modulePath);
            const binaryPath = toUnpackedPath(
                resolve(__dirname, '../../powerpoint-helper/net8.0/PowerPoint'),
            );
            powerPoint = dotnet.require(binaryPath);
            return powerPoint.Helper;
        } catch (error) {
            console.error('Error in getSlidesCount:', error);
        }
        return null;
    });
}

export const provider = {
    appType: 'desktop',
    isDesktop: true,
    fontUtils,
    cryptoUtils,
    browserUtils,
    messageUtils,
    httpUtils,
    pathUtils,
    fileUtils,
    systemUtils,
    appInfo: {
        name: appInfo.name,
        description: appInfo.description,
        author: appInfo.author,
        homepage: appInfo.homepage,
        version: appInfo.version,
        versionNumber: toVersionNumber(appInfo.version),
    },
    reload: () => {
        window.location.reload();
    },
    appUtils,
    databaseUtils,
    powerPointUtils: { getPowerPointHelper },
};
