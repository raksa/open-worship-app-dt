import { join, parse } from 'node:path';
import { existsSync, lstatSync, readFileSync, writeFileSync } from 'node:fs';
import { convert } from 'libreoffice-convert';
import { PDFPage } from 'mupdf';
import { ColorSpace, Matrix, PDFDocument } from 'mupdf/mupdfjs';

function getPdfDoc(filePath: string) {
    return PDFDocument.openDocument(
        readFileSync(filePath), 'application/pdf',
    );
}

export type PdfMiniInfoType = {
    width: number, height: number, count: number,
};
export function getPdfInfo(filePath: string): {
    page: PdfMiniInfoType,
} | null {
    try {
        const doc = getPdfDoc(filePath);
        const count = doc.countPages();
        if (count > 0) {
            const page = doc.loadPage(0);
            const pixmap = page.toPixmap(
                Matrix.identity, ColorSpace.DeviceRGB, false, true,
            );
            return {
                page: {
                    width: pixmap.getWidth(),
                    height: pixmap.getHeight(),
                    count,
                },
            };
        }
        return { page: { width: 0, height: 0, count } };
    } catch (error) {
        console.log(error);
    }
    return null;
}

type MatrixScaleType = [number, number, number, number, number, number];

function getPixmap(
    page: PDFPage, matrixScale: MatrixScaleType, isAlpha: boolean,
) {
    return page.toPixmap(
        matrixScale, ColorSpace.DeviceRGB, isAlpha, true,
    );
}

function toImageData(data: Uint8Array<ArrayBufferLike>, imageType: string) {
    const b64Data = Buffer.from(data).toString('base64');
    return `data:image/${imageType};base64,${b64Data}`;
}

function genPdfPagePng(
    page: PDFPage, matrixScale: MatrixScaleType, isAlpha: boolean,
) {
    const pixmap = getPixmap(page, matrixScale, isAlpha);
    return toImageData(pixmap.asPNG(), 'jpeg');
}

function genPdfPageJpeg(
    page: PDFPage, matrixScale: MatrixScaleType, imageQuality: number,
) {
    const pixmap = getPixmap(page, matrixScale, false);
    imageQuality = Math.max(0, Math.min(100, imageQuality));
    return toImageData(pixmap.asJPEG(imageQuality, false), 'jpeg');
}

export type PdfImageOptionsType = {
    width: number, alpha?: boolean, quality?: number,
    type?: 'png' | 'jpeg',
};
export function getPdfPageImage(
    filePath: string, pageIndex: number, options: PdfImageOptionsType,
): string | null {
    try {
        const doc = getPdfDoc(filePath);
        if (pageIndex < 0 || pageIndex > doc.countPages() - 1) {
            throw new Error(
                `Invalid page index, arguments: ${JSON.stringify(arguments)}`,
            );
        }
        const {
            width, alpha = false, quality: imageQuality = 100, type = 'jpeg',
        } = options;
        if (width < 0) {
            throw new Error(
                `Invalid width, arguments: ${JSON.stringify(arguments)}`,
            );
        }
        const page = doc.loadPage(pageIndex);
        const pixmap = page.toPixmap(
            Matrix.identity, ColorSpace.DeviceRGB, false, true,
        );
        const scale = width / pixmap.getWidth();
        const matrixScale: MatrixScaleType = [scale, 0, 0, scale, 0, 0];
        if (type === 'jpeg') {
            return genPdfPageJpeg(page, matrixScale, imageQuality);
        } else if (type === 'png') {
            return genPdfPagePng(page, matrixScale, alpha);
        }
    } catch (error) {
        console.log(error);
    }
    return null;
}


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
