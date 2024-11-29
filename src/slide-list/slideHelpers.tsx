import ReactDOMServer from 'react-dom/server';

import { openAlert, openConfirm } from '../alert/alertHelpers';
import SlideListEventListener from '../event/SlideListEventListener';
import DirSource from '../helper/DirSource';
import { handleError } from '../helper/errorHelpers';
import FileSource from '../helper/FileSource';
import { showAppContextMenu } from '../others/AppContextMenu';
import PdfController from '../pdf/PdfController';
import appProvider from '../server/appProvider';
import {
    AppMimetypeType, fsCopyFilePathToPath, fsDeleteFile, getFileFullName,
} from '../server/fileHelper';
import {
    openSlideItemQuickEdit,
} from '../slide-presenter/HandleItemSlideEdit';
import { showSimpleToast } from '../toast/toastHelpers';
import Slide from './Slide';
import SlideItem from './SlideItem';
import { checkIsWindowEditorMode } from '../router/routeHelpers';
import { DroppedFileType } from '../others/droppingFileHelpers';

export const MIN_THUMBNAIL_SCALE = 1;
export const THUMBNAIL_SCALE_STEP = 0.2;
export const MAX_THUMBNAIL_SCALE = 3;
export const DEFAULT_THUMBNAIL_SIZE = 250;
export const THUMBNAIL_WIDTH_SETTING_NAME = 'presenter-item-thumbnail-size';

export type SlideDynamicType = Slide | null | undefined;

export function toScaleThumbSize(isUp: boolean, currentScale: number) {
    let newScale = currentScale + (isUp ? -1 : 1) * THUMBNAIL_SCALE_STEP;
    if (newScale < MIN_THUMBNAIL_SCALE) {
        newScale = MIN_THUMBNAIL_SCALE;
    }
    if (newScale > MAX_THUMBNAIL_SCALE) {
        newScale = MAX_THUMBNAIL_SCALE;
    }
    return newScale;
}

export function openSlideContextMenu(event: any,
    slide: Slide, slideItem: SlideItem) {
    showAppContextMenu(event, [
        {
            menuTitle: 'Copy',
            onClick: () => {
                SlideItem.copiedItem = slideItem;
            },
        },
        {
            menuTitle: 'Duplicate',
            onClick: () => {
                slide.duplicateItem(slideItem);
            },
        },
        {
            menuTitle: 'Quick Edit',
            onClick: () => {
                const isEditor = checkIsWindowEditorMode();
                if (isEditor) {
                    SlideListEventListener.selectSlideItem(slideItem);
                } else {
                    openSlideItemQuickEdit(slideItem);
                }
            },
        },
        {
            menuTitle: 'Delete',
            onClick: () => {
                slide.deleteItem(slideItem);
            },
        },
    ]);
}

export const pdfMimetype: AppMimetypeType = {
    type: 'PDF File',
    title: 'PDF File',
    mimetype: 'application/pdf',
    mimetypeName: 'other',
    extensions: ['.pdf'],
};

export function checkIsPdf(ext: string) {
    return ext.toLocaleLowerCase() === '.pdf';
}

export const supportOfficeFE = [
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.odp',
];

export async function convertOfficeFile(
    file: DroppedFileType, dirSource: DirSource,
) {
    const toHtmlBold = (text: string) => {
        return `<b>${text}</b>`;
    };
    const { dirPath } = dirSource;
    const title = 'Converting to PDF';
    const fileFullName = getFileFullName(file);
    const confirmMessage = ReactDOMServer.renderToStaticMarkup(<div>
        <b>{fileFullName}</b>
        {' will be converted to PDF into '}
        <b>{dirPath}</b>
    </div>);
    const isOk = await openConfirm(title, confirmMessage);
    if (!isOk) {
        return;
    }
    const isFilePath = typeof file === 'string';
    let filePath = '';
    try {
        if (isFilePath) {
            filePath = file;
        } else {
            filePath = appProvider.pathUtils.join(
                dirSource.dirPath, 'temp-dropped-file',
            );
            if (!await fsCopyFilePathToPath(file, filePath)) {
                throw new Error('Fail to copy file');
            }
        }
        showSimpleToast(
            title, `"${toHtmlBold(filePath)}", do not close application`,
        );
        await appProvider.pdfUtils.toPdf(filePath, dirPath, fileFullName);
        showSimpleToast(
            title, `${toHtmlBold(fileFullName)} is converted to PDF`,
        );
    } catch (error: any) {
        if (error.message.includes('Could not find office binary')) {
            const alertMessage = ReactDOMServer.renderToStaticMarkup(<div>
                <b>LibreOffice</b>
                {' is required to convert Office file to PDF.'}
                <br />
                <b>
                    <a href={
                        'https://www.google.com/search?q=download+libreoffice'
                    }
                        target='_blank'>
                        Download
                    </a>
                </b>
            </div>);
            openAlert('LibreOffice is not installed', alertMessage);
            return;
        }
        handleError(error);
        showSimpleToast(title, `Fail to convert ${toHtmlBold(filePath)}`);
        if (!isFilePath) {
            await fsDeleteFile(filePath);
        }
    }
}

export async function readPdfToSlide(filePath: string) {
    const pdfManager = PdfController.getInstance();
    try {
        const fileSource = FileSource.getInstance(filePath);
        const imageDataList = await pdfManager.genPdfImages(fileSource.src);
        const slide = new Slide(filePath, {
            items: [],
            metadata: {},
        });
        slide._pdfImageDataList = imageDataList;
        return slide;
    } catch (error) {
        handleError(error);
    }
    return null;
}
