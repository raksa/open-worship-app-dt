import '../app-document-presenter/items/SlidePreviewer.scss';

import { useSelectedLyricContext } from './lyricHelpers';
import { VaryAppDocumentContext } from '../app-document-list/appDocumentHelpers';
import VaryAppDocumentItemsPreviewerComp from '../app-document-presenter/items/VaryAppDocumentItemsPreviewerComp';
import AppDocument from '../app-document-list/AppDocument';
import Slide from '../app-document-list/Slide';
import { getDefaultScreenDisplay } from '../_screen/managers/screenHelpers';
import AppDocumentPreviewerFooterComp from '../app-document-presenter/items/AppDocumentPreviewerFooterComp';
import { getAppMimetype, MimetypeNameType } from '../server/fileHelpers';
import {
    ContextMenuItemType,
    showAppContextMenu,
} from '../context-menu/appContextMenuHelpers';
import ScreenVaryAppDocumentManager from '../_screen/managers/ScreenVaryAppDocumentManager';
import { genShowOnScreensContextMenu } from '../others/FileItemHandlerComp';

class LyricSlide extends Slide {}

class LyricAppDocument extends AppDocument {
    static readonly mimetypeName: MimetypeNameType = 'lyric';
    isEditable = false;

    static toAppDocumentFilePath(lyricFilePath: string) {
        const mimetypeList = getAppMimetype('appDocument');
        const filePath = `${lyricFilePath}${mimetypeList[0].extensions[0]}`;
        return filePath;
    }

    async getSlides() {
        const display = getDefaultScreenDisplay();
        return [
            new LyricSlide(this.filePath, {
                id: 0,
                canvasItems: [],
                metadata: {
                    width: display.bounds.width,
                    height: display.bounds.height,
                },
            }),
            new LyricSlide(this.filePath, {
                id: 1,
                canvasItems: [],
                metadata: {
                    width: display.bounds.width,
                    height: display.bounds.height,
                },
            }),
        ];
    }

    async showContextMenu(_event: any) {
        return;
    }

    showSlideContextMenu(
        event: any,
        slide: Slide,
        extraMenuItems: ContextMenuItemType[] = [],
    ) {
        const menuItemOnScreens = genShowOnScreensContextMenu((event) => {
            ScreenVaryAppDocumentManager.handleSlideSelecting(
                event,
                slide.filePath,
                slide.toJson(),
                true,
            );
        });
        showAppContextMenu(event, [...menuItemOnScreens, ...extraMenuItems]);
    }

    async save(): Promise<boolean> {
        throw new Error('LyricAppDocument does not support saving slides.');
    }
}

export default function LyricSlidesPreviewerComp() {
    const selectedLyric = useSelectedLyricContext();
    return (
        <div className="slide-previewer card w-100 h-100">
            <VaryAppDocumentContext
                value={LyricAppDocument.getInstance(
                    LyricAppDocument.toAppDocumentFilePath(
                        selectedLyric.filePath,
                    ),
                )}
            >
                <div className="card-body w-100 h-100 overflow-hidden">
                    <VaryAppDocumentItemsPreviewerComp />
                </div>
                <AppDocumentPreviewerFooterComp isDisableChanging />
            </VaryAppDocumentContext>
        </div>
    );
}
