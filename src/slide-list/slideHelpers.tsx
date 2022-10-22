import ReactDOMServer from 'react-dom/server';
import { openAlert, openConfirm } from '../alert/alertHelpers';
import { isWindowEditingMode } from '../App';
import SlideListEventListener from '../event/SlideListEventListener';
import ToastEventListener from '../event/ToastEventListener';
import DirSource from '../helper/DirSource';
import FileSource from '../helper/FileSource';
import { showAppContextMenu } from '../others/AppContextMenu';
import appProvider from '../server/appProvider';
import { AppMimetypeType } from '../server/fileHelper';
import { openItemSlideEdit } from '../slide-presenting/HandleItemSlideEdit';
import Slide from './Slide';
import SlideItem from './SlideItem';

export const MIN_THUMBNAIL_SCALE = 1;
export const THUMBNAIL_SCALE_STEP = 0.2;
export const MAX_THUMBNAIL_SCALE = 3;
export const DEFAULT_THUMBNAIL_SIZE = 250;
export const THUMBNAIL_WIDTH_SETTING_NAME = 'presenting-item-thumbnail-size';

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
            title: 'Copy', onClick: () => {
                SlideItem.copiedItem = slideItem;
            },
        },
        {
            title: 'Duplicate', onClick: () => {
                slide.duplicateItem(slideItem);
            },
        },
        {
            title: 'Quick Edit', onClick: () => {
                const isEditing = isWindowEditingMode();
                if (isEditing) {
                    SlideListEventListener.selectSlideItem(slideItem);
                } else {
                    openItemSlideEdit(slideItem);
                }
            },
        },
        {
            title: 'Delete', onClick: () => {
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

export async function convertOfficeFile(fileSource: FileSource,
    dirSource: DirSource) {
    const toHtmlBold = (text: string) => {
        return `<b>${text}</b>`;
    };
    const { filePath, fileName } = fileSource;
    const { dirPath } = dirSource;
    const title = 'Converting to PDF';
    const confirmMessage = ReactDOMServer.renderToStaticMarkup(<div>
        <b>{fileName}</b>
        {' will be converted to PDF into '}
        <b>{dirPath}</b>
    </div>);
    const isOk = await openConfirm(title, confirmMessage);
    if (!isOk) {
        return;
    }
    ToastEventListener.showSimpleToast({
        title,
        message: `${toHtmlBold(filePath)}, do not close application`,
    });
    try {
        await appProvider.pdfUtils.toPdf(filePath, dirPath);
        ToastEventListener.showSimpleToast({
            title,
            message: `${toHtmlBold(fileName)} is converted to PDF`,
        });
        dirSource.fireReloadEvent();
    } catch (error: any) {
        if (error.message.includes('Could not find soffice binary')) {
            const alertMessage = ReactDOMServer.renderToStaticMarkup(<div>
                <b>LibreOffice</b>
                {' is required to convert Office file to PDF.'}
                <br />
                <b>
                    <a href='https://www.google.com/search?q=download+libreoffice'
                        target='_blank'>Download</a>
                </b>
            </div>);
            openAlert('LibreOffice is not installed', alertMessage);
            return;
        }
        appProvider.appUtils.handleError(error);
        ToastEventListener.showSimpleToast({
            title,
            message: `Fail to convert ${toHtmlBold(fileName)}`,
        });
    }
}
