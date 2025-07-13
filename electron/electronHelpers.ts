import { resolve } from 'node:path';
import { app, shell } from 'electron';
import { x as tarX } from 'tar';

import appInfo from '../package.json';

export const isDev = process.env.NODE_ENV === 'development';

export const isWindows = process.platform === 'win32';
export const isMac = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';
export const isSecured = false; // TODO: make it secure
export const is64System = process.arch === 'x64';
export const isArm64 = process.arch === 'arm64';

export function tarExtract(filePath: string, outputDir: string) {
    return (tarX as any)({ file: filePath, cwd: outputDir });
}

interface ClosableInt {
    close: () => void;
}

export function toUnpackedPath(path: string) {
    return path.replace('app.asar', 'app.asar.unpacked');
}
export function attemptClosing(win?: ClosableInt | null) {
    try {
        win?.close();
    } catch (_error) {}
}

// src/event/KeyboardEventListener.ts
export type KeyboardType =
    | 'ArrowUp'
    | 'ArrowRight'
    | 'PageUp'
    | 'ArrowDown'
    | 'ArrowLeft'
    | 'PageDown'
    | 'Enter'
    | 'Tab'
    | 'Escape'
    | ' ';
export const allArrows: KeyboardType[] = [
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
];
export type WindowsControlType = 'Ctrl' | 'Alt' | 'Shift';
export type LinuxControlType = 'Ctrl' | 'Alt' | 'Shift';
export type MacControlType = 'Ctrl' | 'Option' | 'Shift' | 'Meta';
export type AllControlType = 'Ctrl' | 'Shift';
export enum PlatformEnum {
    Windows = 'Windows',
    Mac = 'Mac',
    Linux = 'Linux',
}
export interface EventMapper {
    wControlKey?: WindowsControlType[];
    mControlKey?: MacControlType[];
    lControlKey?: LinuxControlType[];
    allControlKey?: AllControlType[];
    platforms?: PlatformEnum[];
    key: string;
}
const keyNameMap: { [key: string]: string } = {
    Meta: 'Command',
};
export function toShortcutKey(eventMapper: EventMapper) {
    let key = eventMapper.key;
    if (!key) {
        return '';
    }
    if (key.length === 1) {
        key = key.toUpperCase();
    }
    const { wControlKey, mControlKey, lControlKey, allControlKey } =
        eventMapper;
    const allControls: string[] = allControlKey ?? [];
    if (isWindows) {
        allControls.push(...(wControlKey ?? []));
    } else if (isMac) {
        allControls.push(...(mControlKey ?? []));
    } else if (isLinux) {
        allControls.push(...(lControlKey ?? []));
    }
    if (allControls.length > 0) {
        const allControlKeys = allControls.map((key) => {
            return keyNameMap[key] ?? key;
        });
        const sorted = [...allControlKeys].sort((a, b) => {
            return a.localeCompare(b);
        });
        key = `${sorted.join(' + ')} + ${key}`;
    }
    return key;
}

export function goDownload() {
    const url = new URL(`${appInfo.homepage}/download`);
    url.searchParams.set('mv', app.getVersion());
    shell.openExternal(url.toString());
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
export function getSlidesCount(
    powerPointFilePath: string,
    dotNetRoot?: string,
) {
    if (powerPoint === null) {
        if (dotNetRoot) {
            process.env.DOTNET_ROOT = dotNetRoot;
        }
        let modulePath = 'node-api-dotnet/net8.0';
        if (app.isPackaged) {
            modulePath = toUnpackedPath(
                resolve(app.getAppPath(), 'node_modules', modulePath),
            );
        }
        console.log(__dirname);
        console.log(`Unpacked path: ${modulePath}`);
        const dotnet = require(modulePath);
        const binaryPath = toUnpackedPath(
            resolve(__dirname, '../powerpoint-helper/net8.0/PowerPoint'),
        );
        console.log(`Binary path: ${binaryPath}`);
        powerPoint = dotnet.require(binaryPath);
        scheduleRelease();
    }
    const count = powerPoint.Helper.countSlides(powerPointFilePath);
    return count;
}
