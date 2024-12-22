import { fork } from 'child_process';
import { app } from 'electron';
import { resolve as fsResolve } from 'node:path';

type PdfImagePreviewDataType = {
    isSuccessful: boolean, message?: string,
    filePaths?: string[],
};
export function pdfToImages(filePath: string, outDir: string) {
    return new Promise<PdfImagePreviewDataType>((resolve) => {
        const scriptPath = fsResolve(
            app.getAppPath(), 'public/js/pdf-to-images.mjs'
        );
        const forkedProcess = fork(scriptPath);
        forkedProcess.on('message', (data: any) => {
            forkedProcess.kill();
            resolve(data);
        });
        forkedProcess.send({ filePath, outDir });
    });
}
