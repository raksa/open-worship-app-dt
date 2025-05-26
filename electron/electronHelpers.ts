import { x as tarX } from 'tar';

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

export function attemptClosing(win?: ClosableInt | null) {
    try {
        win?.close();
    } catch (_error) {}
}
