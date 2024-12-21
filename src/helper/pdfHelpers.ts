import SlideItem from '../slide-list/SlideItem';
import { useAppEffectAsync } from './debuggerHelpers';
import { useState } from 'react';
import appProvider from '../server/appProvider';
import { genReturningEventName } from '../server/appHelpers';

export type PdfMiniInfoType = {
    width: number, height: number, count: number,
};
export function getPdfInfo(filePath: string) {
    return new Promise<{ page: PdfMiniInfoType } | null>((resolve) => {
        const eventName = 'main:app:pdf-info';
        const replyEventName = genReturningEventName(eventName);
        appProvider.messageUtils.listenOnceForData(
            replyEventName, (_, data: any) => {
                resolve(data);
            },
        );
        appProvider.messageUtils.sendData(eventName, {
            replyEventName, filePath,
        });
    });
}

export type PdfImageOptionsType = {
    width?: number, alpha?: boolean, quality?: number,
    type?: 'png' | 'jpeg',
};
export function getPdfPageImage(
    filePath: string, pageIndex: number, options: PdfImageOptionsType,
) {
    return new Promise<string | null>((resolve) => {
        const eventName = 'main:app:pdf-page-image';
        const replyEventName = genReturningEventName(eventName);
        appProvider.messageUtils.listenOnceForData(
            replyEventName, (_, data: any) => {
                resolve(data);
            },
        );
        appProvider.messageUtils.sendData(eventName, {
            replyEventName, filePath, pageIndex, options,
        });
    });
}

export function useSlideItemPdfImage(slideItem: SlideItem, width?: number) {
    const [imageData, setImageData] = useState<string | null>(null);
    useAppEffectAsync(async (contextMethod) => {
        let imageData: string | null = null;
        if (width === undefined) {
            imageData = await getPdfPageImage(
                slideItem.filePath, slideItem.id, {
                width: slideItem.width, type: 'png',
            });
        } else {
            imageData = await getPdfPageImage(
                slideItem.filePath, slideItem.id, {
                width, type: 'jpeg', quality: 50,
            });
        }
        contextMethod.setImageData(imageData);
    }, [slideItem], { setImageData });
    return imageData;
}
