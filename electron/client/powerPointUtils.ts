import { resolve } from 'node:path';
import { toUnpackedPath, unlocking } from '../electronHelpers';
import { ipcRenderer } from 'electron';

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
                    resolve(__dirname, '../../bin-helper/bin'),
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
                resolve(__dirname, '../../bin-helper/net8.0/PowerPoint'),
            );
            powerPoint = dotnet.require(binaryPath);
            return powerPoint.Helper;
        } catch (error) {
            console.error('Error in getSlidesCount:', error);
        }
        return null;
    });
}

export const powerPointUtils = { getPowerPointHelper };
