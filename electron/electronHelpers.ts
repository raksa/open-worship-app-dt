import { readFileSync } from 'node:fs';
import { ColorSpace, Matrix, PDFDocument } from 'mupdf/mupdfjs';
import { PDFPage } from 'mupdf';

export const isDev = process.env.NODE_ENV === 'development';

export const isWindows = process.platform === 'win32';
export const isMac = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';
export const isSecured = false; // TODO: make it secure

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
            throw new Error(`Invalid page index, arguments: ${arguments}`);
        }
        const {
            width, alpha = false, quality: imageQuality = 100, type = 'jpeg',
        } = options;
        if (width < 0) {
            throw new Error(`Invalid width, arguments: ${arguments}`);
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
