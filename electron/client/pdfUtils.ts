import path from 'node:path';
import fs from 'node:fs';

const ext = '.pdf';
function officeFileToPdf(
    filePath: string, outputDir: string, fileFullName: string,
) {
    return new Promise<void>((resolve, reject) => {
        const { convert } = require('libreoffice-convert');
        const fileName = path.parse(fileFullName).name;
        if (!fs.existsSync(filePath)) {
            throw new Error(`File ${filePath} not found`);
        }
        if (!fs.existsSync(outputDir) ||
            !fs.lstatSync(outputDir).isDirectory()) {
            throw new Error(`Directory ${outputDir} does not exist`);
        }
        const outputPath = path.join(outputDir, `${fileName}${ext}`);
        if (fs.existsSync(outputPath)) {
            throw new Error(`PDF file ${outputPath} already exists`);
        }
        const docxBuf = fs.readFileSync(filePath);
        convert(docxBuf, ext, undefined, (err: any, result: any) => {
            if (err) {
                return reject(err);
            }
            fs.writeFileSync(outputPath, result);
            resolve();
        });
    });
}

export default {
    officeFileToPdf,
};
