import { join, parse } from 'node:path';
import { existsSync, lstatSync, readFileSync, writeFileSync } from 'node:fs';
import { convert } from 'libreoffice-convert';

const PDF_EXT = '.pdf';
export function officeFileToPdf(
    filePath: string, outputDir: string, fileFullName: string,
) {
    return new Promise<void>((resolve, reject) => {
        const fileName = parse(fileFullName).name;
        if (!existsSync(filePath)) {
            throw new Error(`File ${filePath} not found`);
        }
        if (!existsSync(outputDir) ||
            !lstatSync(outputDir).isDirectory()) {
            throw new Error(`Directory ${outputDir} does not exist`);
        }
        const outputPath = join(outputDir, `${fileName}${PDF_EXT}`);
        if (existsSync(outputPath)) {
            throw new Error(`PDF file ${outputPath} already exists`);
        }
        const docxBuf = readFileSync(filePath);
        convert(docxBuf, PDF_EXT, undefined, (err: any, result: any) => {
            if (err) {
                return reject(new Error(err));
            }
            writeFileSync(outputPath, result);
            resolve();
        });
    });
}
