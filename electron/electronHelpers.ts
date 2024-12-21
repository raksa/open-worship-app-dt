import { x as tarX } from 'tar';

export const isDev = process.env.NODE_ENV === 'development';

export const isWindows = process.platform === 'win32';
export const isMac = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';
export const isSecured = false; // TODO: make it secure

export function tarExtract(filePath: string, outputDir: string) {
    return (tarX as any)(filePath, outputDir);
}
