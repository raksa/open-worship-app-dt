import { parse } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { convert } from 'libreoffice-convert';

const PDF_EXT = '.pdf';
export function officeFileToPdf(officeFilePath: string, pdfFilePath: string) {
    return new Promise<void>((resolve, reject) => {
        mkdirSync(parse(pdfFilePath).dir, { recursive: true });
        const docxBuf = readFileSync(officeFilePath);
        convert(docxBuf, PDF_EXT, undefined, (err: any, result: any) => {
            if (err) {
                return reject(new Error(err));
            }
            writeFileSync(pdfFilePath, result);
            resolve();
        });
    });
}
