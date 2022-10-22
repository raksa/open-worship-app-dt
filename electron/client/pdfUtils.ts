const ext = '.pdf';

function toFuturePdfPath(filePath: string, outputDir: string) {
    const path = require('path') as typeof import('path');
    const fileName = path.basename(filePath);
    return path.join(outputDir, `${fileName}${ext}`);
}

function toPdf(filePath: string, outputDir: string) {
    return new Promise<void>((resolve, reject) => {
        const { convert } = require('libreoffice-convert');
        const path = require('path') as typeof import('path');
        const fs = require('fs') as typeof import('fs');
        const fileName = path.basename(filePath);
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
    toPdf,
    toFuturePdfPath,
};
