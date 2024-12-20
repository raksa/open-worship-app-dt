import ReactDOMServer from 'react-dom/server';

import { openAppAlert, openAppConfirm } from '../alert/alertHelpers';
import SlideListEventListener from '../event/SlideListEventListener';
import DirSource from '../helper/DirSource';
import { handleError } from '../helper/errorHelpers';
import FileSource from '../helper/FileSource';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenu';
import PdfController from '../pdf/PdfController';
import appProvider from '../server/appProvider';
import {
    fsCheckFileExist, fsCopyFilePathToPath, fsDeleteFile, getFileFullName,
    mimetypePdf,
} from '../server/fileHelpers';
import {
    openSlideItemQuickEdit,
} from '../slide-presenter/HandleItemSlideEdit';
import { showSimpleToast } from '../toast/toastHelpers';
import Slide from './Slide';
import SlideItem from './SlideItem';
import { DroppedFileType } from '../others/droppingFileHelpers';
import {
    hideProgressBard, showProgressBard,
} from '../progress-bar/progressBarHelpers';
import { getTempPath } from '../server/appHelpers';
import { dirSourceSettingNames } from '../helper/constants';
import { genShowOnScreensContextMenu } from '../others/FileItemHandler';
import ScreenSlideManager from '../_screen/ScreenSlideManager';

export const MIN_THUMBNAIL_SCALE = 1;
export const THUMBNAIL_SCALE_STEP = 1;
export const MAX_THUMBNAIL_SCALE = 10;
export const DEFAULT_THUMBNAIL_SIZE_FACTOR = 1000 / MAX_THUMBNAIL_SCALE;
export const THUMBNAIL_WIDTH_SETTING_NAME = 'presenter-item-thumbnail-size';

export type SlideDynamicType = Slide | null | undefined;

export function openSlideContextMenu(
    event: any, slide: Slide, slideItem: SlideItem,
) {
    const menuItems: ContextMenuItemType[] = [
        {
            menuTitle: 'Copy',
            onClick: () => {
                navigator.clipboard.writeText(slideItem.clipboardSerialize());
                showSimpleToast('Copied', 'SlideItem is copied');
            },
        },
        {
            menuTitle: 'Duplicate',
            onClick: () => {
                slide.duplicateItem(slideItem);
            },
        },
        ...(appProvider.isPagePresenter ? [{
            menuTitle: 'Quick Edit',
            onClick: () => {
                if (appProvider.isPageEditor) {
                    SlideListEventListener.selectSlideItem(slideItem);
                } else {
                    openSlideItemQuickEdit(slideItem);
                }
            },
        }] : []),
        ...genShowOnScreensContextMenu(
            (event) => {
                ScreenSlideManager.handleSlideSelecting(
                    event, slideItem.filePath, slideItem.toJson(), true,
                );
            }
        ),
        {
            menuTitle: 'Delete',
            onClick: () => {
                slide.deleteItem(slideItem);
            },
        },
    ];
    showAppContextMenu(event, menuItems);
}

export function checkIsPdf(ext: string) {
    return mimetypePdf.extensions.includes(ext.toLocaleLowerCase());
}

export const supportOfficeFileExtensions = [
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
        <b>"{fileFullName}"</b>
        {' will be converted to PDF into '}
        <b>{dirPath}</b>
    </div>);
    return openAppConfirm(WIDGET_TITLE, confirmMessage);
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
            openAppAlert('LibreOffice is not installed', alertMessage);
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

export async function selectSlide(event: any, currentFilePath: string) {
    const dirSource = await DirSource.getInstance(
        dirSourceSettingNames.SLIDE,
    );
    const newFilePaths = await dirSource.getFilePaths('slide');
    if (newFilePaths?.length) {
        return new Promise<Slide | null>((resolve) => {
            const menuItems = newFilePaths.filter((filePath) => {
                return filePath !== currentFilePath;
            }).map((filePath) => {
                return {
                    menuTitle: appProvider.pathUtils.basename(filePath),
                    title: filePath,
                    onClick: async () => {
                        const slide = await Slide.readFileToData(filePath);
                        resolve(slide || null);
                    },
                } as ContextMenuItemType;
            });
            showAppContextMenu(event, menuItems);
        });
    }
    return null;
}
