// @ts-nocheck
import { readFileSync } from 'node:fs';
import { dynamicImport } from 'tsimportlib';
import type { PDFPage } from 'mupdf';
import type mupdfjs from 'mupdf/mupdfjs';

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

async function loadMupdfJs(): Promise<typeof mupdfjs> {
    return dynamicImport('mupdf/mupdfjs', module);
}

const cache: Map<string, { doc: any, time: number }> = new Map();
const expireTime = 1000 * 60 * 5; // 5 minutes
const recheckingTime = 1000 * 60 * 1; // 5 minutes
function clearCache() {
    for (const [key, { doc, time }] of cache) {
        if (doc.countPages() === 0 || ((Date.now() - time) > expireTime)) {
            cache.delete(key);
        }
    }
    if (cache.size > 0) {
        setTimeout(clearCache, recheckingTime);
    }
}
async function getPdfDoc(filePath: string, isForce: boolean) {
    return await unlocking(filePath, async () => {
        if (
            !isForce && cache.has(filePath) &&
            cache.get(filePath)?.doc.countPages() > 0
        ) {
            const { doc } = cache.get(filePath);
            cache.set(filePath, { doc, time: Date.now() });
            return doc;
        }
        const { PDFDocument } = await loadMupdfJs();
        const doc = PDFDocument.openDocument(
            readFileSync(filePath), 'application/pdf',
        );
        cache.set(filePath, { doc, time: Date.now() });
        clearCache();
        return doc;
    });
}

export type PdfMiniInfoType = {
    width: number, height: number, count: number,
};
export async function getPdfInfo(filePath: string) {
    const { ColorSpace, Matrix } = await loadMupdfJs();
    if (!filePath) {
        return null;
    }
    try {
        const doc = await getPdfDoc(filePath);
        const count = await doc.countPages();
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
            } as {
                page: PdfMiniInfoType,
            };
        }
        return { page: { width: 0, height: 0, count } };
    } catch (error) {
        console.log(error);
    }
    return null;
}

type MatrixScaleType = [number, number, number, number, number, number];

async function getPixmap(
    page: PDFPage, matrixScale: MatrixScaleType, isAlpha: boolean,
) {
    const { ColorSpace } = await loadMupdfJs();
    return page.toPixmap(
        matrixScale, ColorSpace.DeviceRGB, isAlpha, true,
    );
}

function toImageData(data: Uint8Array<ArrayBufferLike>, imageType: string) {
    const b64Data = Buffer.from(data).toString('base64');
    return `data:image/${imageType};base64,${b64Data}`;
}

async function genPdfPagePng(
    page: PDFPage, matrixScale: MatrixScaleType, isAlpha: boolean,
) {
    const pixmap = await getPixmap(page, matrixScale, isAlpha);
    return toImageData(pixmap.asPNG(), 'jpeg');
}

async function genPdfPageJpeg(
    page: PDFPage, matrixScale: MatrixScaleType, imageQuality: number,
) {
    const pixmap = await getPixmap(page, matrixScale, false);
    imageQuality = Math.max(0, Math.min(100, imageQuality));
    return toImageData(pixmap.asJPEG(imageQuality, false), 'jpeg');
}

export type PdfImageOptionsType = {
    width?: number, alpha?: boolean, quality?: number,
    type?: 'png' | 'jpeg',
};
export async function getPdfPageImage(
    filePath: string, pageIndex: number, options: PdfImageOptionsType,
    isNoCache = false,
) {
    const { ColorSpace, Matrix } = await loadMupdfJs(isNoCache);
    try {
        const doc = await getPdfDoc(filePath);
        if (pageIndex < 0 || pageIndex > doc.countPages() - 1) {
            if (doc.countPages() === 0) {
                return await getPdfPageImage(
                    filePath, pageIndex, options, true,
                );
            }
            throw new Error(
                `Invalid page index, arguments: ${JSON.stringify(arguments)}`,
            );
        }
        const {
            alpha = false, quality: imageQuality = 100, type = 'jpeg',
        } = options;
        if (options.width !== undefined && options.width < 0) {
            throw new Error(
                `Invalid width, arguments: ${JSON.stringify(arguments)}`,
            );
        }
        const page = doc.loadPage(pageIndex);
        const pixmap = page.toPixmap(
            Matrix.identity, ColorSpace.DeviceRGB, false, true,
        );
        const actualWidth = pixmap.getWidth();
        const width = Math.min(options.width ?? actualWidth, actualWidth);
        const scale = width / pixmap.getWidth();
        const matrixScale: MatrixScaleType = [scale, 0, 0, scale, 0, 0];
        return (
            type === 'jpeg' ? genPdfPageJpeg(page, matrixScale, imageQuality) :
                genPdfPagePng(page, matrixScale, alpha)
        );
    } catch (error) {
        console.log(error);
    }
    return null;
}
