import ReactDOMServer from 'react-dom/server';

import {
    showAppAlert,
    showAppConfirm,
} from '../popup-widget/popupWidgetHelpers';
import AppDocumentListEventListener from '../event/SlideListEventListener';
import DirSource from '../helper/DirSource';
import { handleError } from '../helper/errorHelpers';
import {
    ContextMenuItemType,
    showAppContextMenu,
} from '../others/AppContextMenuComp';
import appProvider from '../server/appProvider';
import {
    fsCheckFileExist,
    fsCopyFilePathToPath,
    fsDeleteFile,
    getFileFullName,
    getFileName,
    mimetypePdf,
    pathBasename,
} from '../server/fileHelpers';
import { openSlideItemQuickEdit } from '../slide-presenter/HandleItemSlideEdit';
import { showSimpleToast } from '../toast/toastHelpers';
import AppDocument, { WrongDimensionType } from './AppDocument';
import Slide, { SlideItemType } from './Slide';
import { DroppedFileType } from '../others/droppingFileHelpers';
import {
    hideProgressBard,
    showProgressBard,
} from '../progress-bar/progressBarHelpers';
import { convertToPdf, getTempPath } from '../server/appHelpers';
import { dirSourceSettingNames } from '../helper/constants';
import { genShowOnScreensContextMenu } from '../others/FileItemHandlerComp';
import ScreenSlideManager from '../_screen/managers/ScreenSlideManager';
import PDFAppDocument from './PDFAppDocument';
import { createContext, use, useState } from 'react';
import { DisplayType } from '../_screen/screenHelpers';
import { useEditingHistoryEvent } from '../others/EditingHistoryManager';
import { getSetting, setSetting } from '../helper/settingHelpers';
import PDFSlide, { PDFSlideType } from './PDFSlide';
import { OptionalPromise } from '../others/otherHelpers';

export const MIN_THUMBNAIL_SCALE = 1;
export const THUMBNAIL_SCALE_STEP = 1;
export const MAX_THUMBNAIL_SCALE = 10;
export const DEFAULT_THUMBNAIL_SIZE_FACTOR = 1000 / MAX_THUMBNAIL_SCALE;
export const THUMBNAIL_WIDTH_SETTING_NAME = 'presenter-item-thumbnail-size';

export type VaryAppDocumentType = AppDocument | PDFAppDocument;
export type VaryAppDocumentItemType = Slide | PDFSlide;
export type VaryAppDocumentItemDataType = SlideItemType | PDFSlideType;
export type VaryAppDocumentDynamicType = VaryAppDocumentType | null | undefined;

export interface ClipboardInf {
    clipboardSerialize(): OptionalPromise<string | null>;
}

export function showPDFDocumentContextMenu(event: any, pdfSlide: PDFSlide) {
    const menuItemOnScreens = genShowOnScreensContextMenu((event) => {
        ScreenSlideManager.handleSlideSelecting(
            event,
            pdfSlide.filePath,
            pdfSlide.toJson(),
            true,
        );
    });
    showAppContextMenu(event, menuItemOnScreens);
}

export function showAppDocumentContextMenu(
    event: any,
    slide: AppDocument,
    slideItem: Slide,
) {
    const menuItemOnScreens = genShowOnScreensContextMenu((event) => {
        ScreenSlideManager.handleSlideSelecting(
            event,
            slideItem.filePath,
            slideItem.toJson(),
            true,
        );
    });
    const menuItems: ContextMenuItemType[] = [
        {
            menuTitle: 'Copy',
            onClick: async () => {
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
        ...(appProvider.isPagePresenter
            ? [
                  {
                      menuTitle: 'Quick Edit',
                      onClick: () => {
                          if (appProvider.isPageEditor) {
                              AppDocumentListEventListener.selectAppDocumentItem(
                                  slideItem,
                              );
                          } else {
                              openSlideItemQuickEdit(slideItem);
                          }
                      },
                  },
              ]
            : []),
        ...menuItemOnScreens,
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

const alertMessage = ReactDOMServer.renderToStaticMarkup(
    <div>
        <b>LibreOffice </b>
        is required for converting Office file to PDF.
        <br />
        <b>
            <a
                href={'https://www.google.com/search?q=libreoffice+download'}
                target="_blank"
            >
                Download
            </a>
            <hr />
            <span>Please download and install LibreOffice then try again.</span>
        </b>
    </div>,
);

const WIDGET_TITLE = 'Converting to PDF';

function showConfirmPdfConvert(dirPath: string, file: DroppedFileType) {
    const fileFullName = getFileFullName(file);
    const confirmMessage = ReactDOMServer.renderToStaticMarkup(
        <div>
            <b>"{fileFullName}"</b>
            {' will be converted to PDF into '}
            <b>{dirPath}</b>
        </div>,
    );
    return showAppConfirm(WIDGET_TITLE, confirmMessage);
}

async function getTempFilePath() {
    const tempDir = getTempPath();
    let tempFilePath: string | null = null;
    let i = 0;
    while (tempFilePath === null || (await fsCheckFileExist(tempFilePath))) {
        tempFilePath = appProvider.pathUtils.join(tempDir, `temp-to-pdf-${i}`);
        i++;
    }
    return tempFilePath;
}

function toHtmlBold(text: string) {
    return `<b>${text}</b>`;
}

async function getPdfFilePath(dirPath: string, fileName: string) {
    let i = 0;
    while (true) {
        const targetPDFFilePath = appProvider.pathUtils.join(
            dirPath,
            `${fileName}${i === 0 ? '' : '-' + i}.pdf`,
        );
        if (!(await fsCheckFileExist(targetPDFFilePath))) {
            return targetPDFFilePath;
        }
        i++;
    }
}

async function startConvertingOfficeFile(
    file: DroppedFileType,
    dirSource: DirSource,
    retryCount = 5,
) {
    const tempFilePath = await getTempFilePath();
    const fileFullName = getFileFullName(file);
    const targetPDFFilePath = await getPdfFilePath(
        dirSource.dirPath,
        getFileName(fileFullName),
    );
    try {
        showProgressBard(WIDGET_TITLE);
        if (!(await fsCopyFilePathToPath(file, tempFilePath, ''))) {
            throw new Error('Fail to copy file');
        }
        showSimpleToast(WIDGET_TITLE, 'Do not close application');
        await convertToPdf(tempFilePath, targetPDFFilePath);
        showSimpleToast(
            WIDGET_TITLE,
            `${toHtmlBold(fileFullName)} is converted to PDF ` +
                `"${targetPDFFilePath}"`,
        );
    } catch (error: any) {
        const regex = /Could not find .+ binary/i;
        if (regex.test(error.message)) {
            showAppAlert('LibreOffice is not installed', alertMessage);
        } else {
            handleError(error);
            if (retryCount > 0) {
                return await startConvertingOfficeFile(
                    file,
                    dirSource,
                    retryCount - 1,
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
    file: DroppedFileType,
    dirSource: DirSource,
) {
    const isConfirm = await showConfirmPdfConvert(dirSource.dirPath, file);
    if (!isConfirm) {
        return;
    }
    await startConvertingOfficeFile(file, dirSource);
}

export async function selectSlide(event: any, currentFilePath: string) {
    const dirSource = await DirSource.getInstance(dirSourceSettingNames.SLIDE);
    const newFilePaths = await dirSource.getFilePaths('slide');
    if (!newFilePaths?.length) {
        return null;
    }
    return new Promise<AppDocument | null>((resolve) => {
        const menuItems = newFilePaths
            .filter((filePath) => {
                return filePath !== currentFilePath;
            })
            .map((filePath) => {
                return {
                    menuTitle: pathBasename(filePath),
                    title: filePath,
                    onClick: () => {
                        const appDocument = AppDocument.getInstance(filePath);
                        resolve(appDocument);
                    },
                } as ContextMenuItemType;
            });
        showAppContextMenu(event, menuItems);
    });
}

export const SelectedVaryAppDocumentContext = createContext<{
    selectedVaryAppDocument: VaryAppDocumentType | null;
    setSelectedAppDocument: (
        newVaryAppDocument: VaryAppDocumentType | null,
    ) => void;
} | null>(null);

function useContext() {
    const context = use(SelectedVaryAppDocumentContext);
    if (context === null) {
        throw new Error('useSelectedSlide must be used within a SlideProvider');
    }
    return context;
}

export function useSelectedVaryAppDocumentContext() {
    const context = useContext();
    if (context.selectedVaryAppDocument === null) {
        throw new Error('No selected document');
    }
    return context.selectedVaryAppDocument;
}

export function useSelectedAppDocumentSetterContext() {
    const context = useContext();
    return context.setSelectedAppDocument;
}

export function useSlideItemChanged(
    varyAppDocumentItem: VaryAppDocumentItemType,
) {
    const [isChanged, setIsChanged] = useState(false);
    useEditingHistoryEvent(varyAppDocumentItem.filePath, async () => {
        const slide = AppDocument.getInstance(varyAppDocumentItem.filePath);
        const isChanged =
            varyAppDocumentItem instanceof Slide &&
            (await slide.checkIsSlideItemChanged(varyAppDocumentItem.id));
        setIsChanged(isChanged);
    });
    return isChanged;
}

export const SelectedEditingSlideItemContext = createContext<{
    selectedVaryAppDocumentItem: VaryAppDocumentItemType | null;
    setSelectedSlideItem: (
        newSelectedVaryAppDocumentItem: VaryAppDocumentItemType | null,
    ) => void;
} | null>(null);

function useContextItem() {
    const context = use(SelectedEditingSlideItemContext);
    if (context === null) {
        throw new Error(
            'useSelectedEditingSlideItemContext must be used within a ' +
                'SelectedEditingSlideItemContext',
        );
    }
    return context;
}

export function useSelectedEditingSlideItemContext() {
    const context = useContextItem();
    if (context.selectedVaryAppDocumentItem === null) {
        throw new Error('No selected slide item');
    }
    return context.selectedVaryAppDocumentItem;
}

export function useSelectedEditingSlideItemSetterContext() {
    const context = useContextItem();
    return context.setSelectedSlideItem;
}

export function useSlideWrongDimension(
    slide: AppDocument,
    display: DisplayType,
) {
    const [wrongDimension, setWrongDimension] =
        useState<WrongDimensionType | null>(null);
    useEditingHistoryEvent(
        slide.filePath,
        async () => {
            const isWrongDimension = await slide.getIsWrongDimension(display);
            setWrongDimension(isWrongDimension);
        },
        [display],
    );
    return wrongDimension;
}

const KEY_SEPARATOR = '<id>';

export function toKeyByFilePath(filePath: string, id: number) {
    return `${filePath}${KEY_SEPARATOR}${id}`;
}

export function appDocumentItemExtractKey(key: string) {
    const [filePath, id] = key.split(KEY_SEPARATOR);
    if (filePath === undefined || id === undefined) {
        return null;
    }
    return {
        filePath,
        id: parseInt(id),
    };
}

export async function appDocumentItemFromKey(key: string) {
    const extracted = appDocumentItemExtractKey(key);
    if (extracted === null) {
        return null;
    }
    const { filePath, id } = extracted;
    if (filePath === undefined || id === undefined) {
        return null;
    }
    const varAppDocument = varyAppDocumentFromFilePath(filePath);
    return await varAppDocument.getItemById(id);
}

const SELECTED_APP_DOCUMENT_SETTING_NAME = 'selected-app-document';
const SELECTED_APP_DOCUMENT_ITEM_SETTING_NAME =
    SELECTED_APP_DOCUMENT_SETTING_NAME + '-item';

async function checkSelectedFilePathExist(filePath: string) {
    if (!filePath || !(await fsCheckFileExist(filePath))) {
        setDocumentSelectedFilePath(null);
        return false;
    }
    return true;
}

export async function getDocumentSelectedFilePath() {
    const selectedFilePath = getSetting(SELECTED_APP_DOCUMENT_SETTING_NAME, '');
    const isValid = await checkSelectedFilePathExist(selectedFilePath);
    if (!isValid) {
        return null;
    }
    return selectedFilePath;
}

export function setDocumentSelectedFilePath(filePath: string | null) {
    setSetting(SELECTED_APP_DOCUMENT_SETTING_NAME, filePath || '');
}

export async function getAppDocumentItemSelectedFilePath() {
    const selectedKey = getSetting(SELECTED_APP_DOCUMENT_ITEM_SETTING_NAME, '');
    const [filePath, idString] = selectedKey.split(KEY_SEPARATOR);
    const selectedFilePath = await getDocumentSelectedFilePath();
    const isValid =
        selectedFilePath === filePath &&
        (await checkSelectedFilePathExist(filePath));
    if (!isValid) {
        return null;
    }
    const id = parseInt(idString);
    if (isNaN(id)) {
        setDocumentItemSelectedFilePath(null, -1);
        return null;
    }
    return { filePath, id };
}

export function setDocumentItemSelectedFilePath(
    filePath: string | null,
    id: number,
) {
    const keyPath = filePath === null ? '' : toKeyByFilePath(filePath, id);
    setSetting(SELECTED_APP_DOCUMENT_ITEM_SETTING_NAME, keyPath);
}

export async function getSelectedVaryAppDocument() {
    const selectedAppDocumentFilePath = await getDocumentSelectedFilePath();
    if (selectedAppDocumentFilePath === null) {
        return null;
    }
    return varyAppDocumentFromFilePath(selectedAppDocumentFilePath);
}

export async function getSelectedVaryAppDocumentItem() {
    const selected = await getAppDocumentItemSelectedFilePath();
    if (selected === null) {
        return null;
    }
    const { filePath, id } = selected;
    const varyAppDocument = varyAppDocumentFromFilePath(filePath);
    return await varyAppDocument.getItemById(id);
}

export function varyAppDocumentFromFilePath(filePath: string) {
    if (checkIsPdf(filePath)) {
        return PDFAppDocument.getInstance(filePath);
    }
    return AppDocument.getInstance(filePath);
}
