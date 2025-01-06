import { fork } from 'child_process';
import { app } from 'electron';
import { resolve as fsResolve } from 'node:path';
import { isDev } from './electronHelpers';

const lockSet = new Set<string>();
async function unlocking<T>(
    key: string, callback: () => (Promise<T> | T)
) {
    if (lockSet.has(key)) {
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
        return unlocking(key, callback);
    }
    lockSet.add(key);
    const data = await callback();
    lockSet.delete(key);
    return data;
}

type PdfImagePreviewDataType = {
    isSuccessful: boolean, message?: string,
    filePaths?: string[],
};

function genImage(filePath: string, outDir: string) {
    return new Promise<PdfImagePreviewDataType>((resolve) => {
        const scriptPath = fsResolve(
            app.getAppPath(), isDev ? 'public' : 'dist', 'js',
            'pdf-to-images.mjs',
        );
        const forkedProcess = fork(scriptPath);
        forkedProcess.on('message', (data: any) => {
            forkedProcess.kill();
            resolve(data);
        });
        forkedProcess.send({ filePath, outDir });
    });
}

const dataMap = new Map<string, PdfImagePreviewDataType>();
export function pdfToImages(
    filePath: string, outDir: string, isForce: boolean,
) {
    return unlocking<PdfImagePreviewDataType>(filePath, async () => {
        if (isForce) {
            dataMap.delete(filePath);
        }
        if (dataMap.has(filePath)) {
            return dataMap.get(filePath)!;
        }
        const data = await genImage(filePath, outDir);
        dataMap.set(filePath, data);
        return data;
    });
}
