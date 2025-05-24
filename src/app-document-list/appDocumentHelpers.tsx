import ReactDOMServer from 'react-dom/server';

import {
    showAppAlert,
    showAppConfirm,
} from '../popup-widget/popupWidgetHelpers';
import AppDocumentListEventListener from '../event/VaryAppDocumentEventListener';
import DirSource from '../helper/DirSource';
import { handleError } from '../helper/errorHelpers';
import {
    ContextMenuItemType,
    showAppContextMenu,
} from '../context-menu/appContextMenuHelpers';
import appProvider from '../server/appProvider';
import {
    fsCheckFileExist,
    fsCopyFilePathToPath,
    fsDeleteFile,
    getFileExtension,
    getFileFullName,
    getFileName,
    mimetypePdf,
    pathBasename,
} from '../server/fileHelpers';
import { openSlideQuickEdit } from '../app-document-presenter/SlideEditHandlerComp';
import { showSimpleToast } from '../toast/toastHelpers';
import AppDocument, { WrongDimensionType } from './AppDocument';
import Slide, { SlideType } from './Slide';
import { DroppedFileType } from '../others/droppingFileHelpers';
import {
    hideProgressBard,
    showProgressBard,
} from '../progress-bar/progressBarHelpers';
import { convertToPdf, getTempPath } from '../server/appHelpers';
import { dirSourceSettingNames } from '../helper/constants';
import { genShowOnScreensContextMenu } from '../others/FileItemHandlerComp';
import ScreenVaryAppDocumentManager from '../_screen/managers/ScreenVaryAppDocumentManager';
import PdfAppDocument from './PdfAppDocument';
import { createContext, use, useState } from 'react';
import { DisplayType } from '../_screen/screenHelpers';
import { getSetting, setSetting } from '../helper/settingHelpers';
import PdfSlide, { PdfSlideType } from './PdfSlide';
import { OptionalPromise } from '../others/otherHelpers';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';

export const MIN_THUMBNAIL_SCALE = 1;
export const THUMBNAIL_SCALE_STEP = 1;
export const MAX_THUMBNAIL_SCALE = 10;
export const DEFAULT_THUMBNAIL_SIZE_FACTOR = 1000 / MAX_THUMBNAIL_SCALE;
export const THUMBNAIL_WIDTH_SETTING_NAME = 'presenter-item-thumbnail-size';

export type VaryAppDocumentType = AppDocument | PdfAppDocument;
export type VaryAppDocumentItemType = Slide | PdfSlide;
export type VaryAppDocumentItemDataType = SlideType | PdfSlideType;
export type VaryAppDocumentDynamicType = VaryAppDocumentType | null | undefined;

export interface ClipboardInf {
    clipboardSerialize(): OptionalPromise<string | null>;
}

export function showPdfDocumentContextMenu(
    event: any,
    pdfSlide: PdfSlide,
    extraMenuItems: ContextMenuItemType[],
) {
    const menuItemOnScreens = genShowOnScreensContextMenu((event) => {
        ScreenVaryAppDocumentManager.handleSlideSelecting(
            event,
            pdfSlide.filePath,
            pdfSlide.toJson(),
            true,
        );
    });
    showAppContextMenu(event, [...menuItemOnScreens, ...extraMenuItems]);
}

export function showAppDocumentContextMenu(
    event: any,
    appDocument: AppDocument,
    slide: Slide,
    extraMenuItems: ContextMenuItemType[],
) {
    const menuItemOnScreens = genShowOnScreensContextMenu((event) => {
        ScreenVaryAppDocumentManager.handleSlideSelecting(
            event,
            slide.filePath,
            slide.toJson(),
            true,
        );
    });
    const menuItems: ContextMenuItemType[] = [
        {
            menuTitle: 'Copy',
            onSelect: async () => {
                navigator.clipboard.writeText(slide.clipboardSerialize());
                showSimpleToast('Copied', 'Slide is copied');
            },
        },
        {
            menuTitle: 'Duplicate',
            onSelect: () => {
                appDocument.duplicateSlide(slide);
            },
        },
        ...(appProvider.isPagePresenter
            ? [
                  {
                      menuTitle: 'Quick Edit',
                      onSelect: () => {
                          if (appProvider.isPageEditor) {
                              AppDocumentListEventListener.selectAppDocumentItem(
                                  slide,
                              );
                          } else {
                              openSlideQuickEdit(slide);
                          }
                      },
                  },
              ]
            : []),
        ...menuItemOnScreens,
        {
            menuTitle: 'Delete',
            onSelect: () => {
                appDocument.deleteSlide(slide);
            },
        },
    ];
    showAppContextMenu(event, [...menuItems, ...extraMenuItems]);
}

export function checkIsPdf(ext: string) {
    return mimetypePdf.extensions.includes(ext.toLocaleLowerCase());
}

const docFileInfo = {
    // Writer (Word Processor)
    '.odt': 'OpenDocument Text',
    '.ott': 'OpenDocument Text Template',
    '.sxw': 'OpenOffice.org 1.x Text Document',
    '.stw': 'OpenOffice.org 1.x Text Template',
    '.doc': 'Microsoft Word 97/2000/XP/2003',
    '.docx': 'Microsoft Word 2007/2010/2013/2016',
    // Impress (Presentation)
    '.odp': 'OpenDocument Presentation',
    '.otp': 'OpenDocument Presentation Template',
    '.sxi': 'OpenOffice.org 1.x Presentation',
    '.sti': 'OpenOffice.org 1.x Presentation Template',
    '.ppt': 'Microsoft PowerPoint 97/2000/XP/2003',
    '.pptx': 'Microsoft PowerPoint 2007/2010/2013/2016',
    // Draw (Drawing)
    '.odg': 'OpenDocument Drawing',
    '.otg': 'OpenDocument Drawing Template',
    '.svg': 'Scalable Vector Graphics',
    '.svgz': 'Compressed Scalable Vector Graphics',
    // Math (Formula Editor)
    '.odf': 'OpenDocument Formula Template',
    '.smf': 'StarMath Formula',
};

export const supportOfficeFileExtensions = Object.keys(docFileInfo);

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
        const targetPdfFilePath = appProvider.pathUtils.join(
            dirPath,
            `${fileName}${i === 0 ? '' : '-' + i}.pdf`,
        );
        if (!(await fsCheckFileExist(targetPdfFilePath))) {
            return targetPdfFilePath;
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
    const targetPdfFilePath = await getPdfFilePath(
        dirSource.dirPath,
        getFileName(fileFullName),
    );
    try {
        showProgressBard(WIDGET_TITLE);
        if (!(await fsCopyFilePathToPath(file, tempFilePath, ''))) {
            throw new Error('Fail to copy file');
        }
        showSimpleToast(WIDGET_TITLE, 'Do not close application');
        await convertToPdf(tempFilePath, targetPdfFilePath);
        showSimpleToast(
            WIDGET_TITLE,
            `${toHtmlBold(fileFullName)} is converted to PDF ` +
                `"${targetPdfFilePath}"`,
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
                    onSelect: () => {
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
    setSelectedVaryAppDocument: (
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
    return context.setSelectedVaryAppDocument;
}

export const SelectedEditingSlideContext = createContext<{
    selectedSlide: Slide | null;
    setSelectedSlide: (newSlide: Slide | null) => void;
} | null>(null);

function useContextItem() {
    const context = use(SelectedEditingSlideContext);
    if (context === null) {
        throw new Error(
            'useSelectedEditingSlideContext must be used within a ' +
                'SelectedEditingSlideContext',
        );
    }
    return context;
}

export function useSelectedEditingSlideContext() {
    const context = useContextItem();
    if (
        context.selectedSlide === null ||
        !(context.selectedSlide instanceof Slide)
    ) {
        throw new Error('No selected slide');
    }
    return context.selectedSlide;
}

export function useSelectedEditingSlideSetterContext() {
    const context = useContextItem();
    return context.setSelectedSlide;
}

export function useSlideWrongDimension(
    varyAppDocument: VaryAppDocumentType,
    display: DisplayType,
) {
    const [wrong, setWrong] = useState<WrongDimensionType | null>(null);
    useFileSourceEvents(
        ['update'],
        async () => {
            if (!AppDocument.checkIsThisType(varyAppDocument)) {
                return;
            }
            const wrong = await varyAppDocument.getIsWrongDimension(display);
            setWrong(wrong);
        },
        [varyAppDocument, display],
        varyAppDocument.filePath,
    );
    return wrong;
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
    const varyAppDocument = varyAppDocumentFromFilePath(filePath);
    return await varyAppDocument.getItemById(id);
}

const SELECTED_APP_DOCUMENT_SETTING_NAME = 'selected-vary-app-document';
const SELECTED_APP_DOCUMENT_ITEM_SETTING_NAME =
    SELECTED_APP_DOCUMENT_SETTING_NAME + '-item';

async function checkSelectedFilePathExist(filePath: string) {
    if (!filePath || !(await fsCheckFileExist(filePath))) {
        setSelectedVaryAppDocumentFilePath(null);
        return false;
    }
    return true;
}

export async function getSelectedVaryAppDocumentFilePath() {
    const selectedFilePath = getSetting(SELECTED_APP_DOCUMENT_SETTING_NAME, '');
    const isValid = await checkSelectedFilePathExist(selectedFilePath);
    if (!isValid) {
        return null;
    }
    return selectedFilePath;
}

export function setSelectedVaryAppDocumentFilePath(filePath: string | null) {
    setSetting(SELECTED_APP_DOCUMENT_SETTING_NAME, filePath ?? '');
}

export async function getSelectedVaryAppDocument() {
    const selectedAppDocumentFilePath =
        await getSelectedVaryAppDocumentFilePath();
    if (selectedAppDocumentFilePath === null) {
        return null;
    }
    return varyAppDocumentFromFilePath(selectedAppDocumentFilePath);
}

export async function setSelectedVaryAppDocument(
    varyAppDocument: VaryAppDocumentType | null,
) {
    setSelectedVaryAppDocumentFilePath(varyAppDocument?.filePath ?? null);
}

export async function getSelectedEditingSlideFilePath() {
    const selectedKey = getSetting(SELECTED_APP_DOCUMENT_ITEM_SETTING_NAME, '');
    const [filePath, idString] = selectedKey.split(KEY_SEPARATOR);
    const selectedAppDocument = await getSelectedVaryAppDocument();
    const isValid =
        AppDocument.checkIsThisType(selectedAppDocument) &&
        (await checkSelectedFilePathExist(filePath)) &&
        selectedAppDocument.filePath === filePath;
    if (!isValid) {
        return null;
    }
    const id = parseInt(idString);
    if (isNaN(id)) {
        setSelectedEditingSlideFilePath(null, -1);
        return null;
    }
    return { filePath, id };
}

export function setSelectedEditingSlideFilePath(
    filePath: string | null,
    id: number,
) {
    const keyPath = filePath === null ? '' : toKeyByFilePath(filePath, id);
    setSetting(SELECTED_APP_DOCUMENT_ITEM_SETTING_NAME, keyPath);
}

export async function getSelectedEditingSlide() {
    const selected = await getSelectedEditingSlideFilePath();
    if (selected === null) {
        return null;
    }
    const { filePath, id } = selected;
    const varyAppDocument = varyAppDocumentFromFilePath(filePath);
    if (!AppDocument.checkIsThisType(varyAppDocument)) {
        return null;
    }
    return await varyAppDocument.getItemById(id);
}

export function setSelectedEditingSlide(slide: Slide | null) {
    setSelectedEditingSlideFilePath(slide?.filePath ?? null, slide?.id ?? -1);
}

export function varyAppDocumentFromFilePath(filePath: string) {
    if (checkIsPdf(getFileExtension(filePath))) {
        return PdfAppDocument.getInstance(filePath);
    }
    return AppDocument.getInstance(filePath);
}
