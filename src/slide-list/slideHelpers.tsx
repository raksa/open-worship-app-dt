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
    AppMimetypeType, fsCheckFileExist, fsCopyFilePathToPath, fsDeleteFile,
    getFileFullName,
} from '../server/fileHelpers';
import {
    openSlideItemQuickEdit,
} from '../slide-presenter/HandleItemSlideEdit';
import { showSimpleToast } from '../toast/toastHelpers';
import Slide from './Slide';
import SlideItem from './SlideItem';
import { checkIsWindowEditorMode } from '../router/routeHelpers';
import { DroppedFileType } from '../others/droppingFileHelpers';
import {
    hideProgressBard, showProgressBard,
} from '../progress-bar/progressBarHelpers';
import { getTempPath } from '../server/appHelpers';

export const MIN_THUMBNAIL_SCALE = 1;
export const THUMBNAIL_SCALE_STEP = 1;
export const MAX_THUMBNAIL_SCALE = 10;
export const DEFAULT_THUMBNAIL_SIZE_FACTOR = 1000 / MAX_THUMBNAIL_SCALE;
export const THUMBNAIL_WIDTH_SETTING_NAME = 'presenter-item-thumbnail-size';

export type SlideDynamicType = Slide | null | undefined;

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

const alertMessage = ReactDOMServer.renderToStaticMarkup(<div>
    <b>LibreOffice </b>
    is required for converting Office file to PDF.
    <br />
    <b>
        <a href={
            'https://www.google.com/search?q=libreoffice+download'
        } target='_blank'>
            Download
        </a>
        <hr />
        <span>
            Please download and install LibreOffice then try again.
        </span>
    </b>
</div>);

const WIDGET_TITLE = 'Converting to PDF';

function showConfirmPDFConvert(dirPath: string, file: DroppedFileType) {
    const fileFullName = getFileFullName(file);
    const confirmMessage = ReactDOMServer.renderToStaticMarkup(<div>
        <b>{fileFullName}</b>
        {' will be converted to PDF into '}
        <b>{dirPath}</b>
    </div>);
    return openConfirm(WIDGET_TITLE, confirmMessage);
}

async function getTempFilePath() {
    const tempDir = getTempPath();
    let tempFilePath: string | null = null;
    let i = 0;
    while (
        tempFilePath === null || await fsCheckFileExist(tempFilePath)
    ) {
        tempFilePath = appProvider.pathUtils.join(tempDir, `temp-to-pdf-${i}`);
        i++;
    }
    return tempFilePath;
}

function toHtmlBold(text: string) {
    return `<b>${text}</b>`;
};

async function startConvertingOfficeFile(
    file: DroppedFileType, dirSource: DirSource,
    retryCount = 5,
) {
    const fileFullName = getFileFullName(file);
    const tempFilePath = await getTempFilePath();
    try {
        showProgressBard(WIDGET_TITLE);
        if (!await fsCopyFilePathToPath(file, tempFilePath, '')) {
            throw new Error('Fail to copy file');
        }
        showSimpleToast(
            WIDGET_TITLE, 'Do not close application',
        );
        await appProvider.pdfUtils.officeFileToPdf(
            tempFilePath, dirSource.dirPath, fileFullName,
        );
        showSimpleToast(
            WIDGET_TITLE, `${toHtmlBold(fileFullName)} is converted to PDF`,
        );
    } catch (error: any) {
        const regex = /Could not find .+ binary/i;
        if (regex.test(error.message)) {
            openAlert('LibreOffice is not installed', alertMessage);
        } else {
            handleError(error);
            if (retryCount > 0) {
                return await startConvertingOfficeFile(
                    file, dirSource, retryCount - 1,
                );
            }
            showSimpleToast(WIDGET_TITLE, 'Fail to convert to PDF');
            fsDeleteFile(tempFilePath).catch((error) => {
                handleError(error);
            });
        }
    }
    hideProgressBard(WIDGET_TITLE);
}

export async function convertOfficeFile(
    file: DroppedFileType, dirSource: DirSource,
) {
    const isConfirm = await showConfirmPDFConvert(dirSource.dirPath, file);
    if (!isConfirm) {
        return;
    }
    await startConvertingOfficeFile(file, dirSource);
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
        slide.pdfImageDataList = imageDataList;
        return slide;
    } catch (error) {
        handleError(error);
    }
    return null;
}
