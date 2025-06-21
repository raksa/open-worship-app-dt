import AppDocument from '../app-document-list/AppDocument';
import Slide from '../app-document-list/Slide';
import { getDefaultScreenDisplay } from '../_screen/managers/screenHelpers';
import { getMimetypeExtensions, MimetypeNameType } from '../server/fileHelpers';
import {
    ContextMenuItemType,
    showAppContextMenu,
} from '../context-menu/appContextMenuHelpers';
import ScreenVaryAppDocumentManager from '../_screen/managers/ScreenVaryAppDocumentManager';
import { genShowOnScreensContextMenu } from '../others/FileItemHandlerComp';
import LyricSlide from './LyricSlide';
import FileSource from '../helper/FileSource';
import Lyric from './Lyric';

export default class LyricAppDocument extends AppDocument {
    static readonly mimetypeName: MimetypeNameType = 'appDocument';
    isEditable = false;

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

    static toAppDocumentFilePath(lyricFilePath: string) {
        const extensions = getMimetypeExtensions(this.mimetypeName);
        if (extensions.length === 0) {
            throw new Error('No extensions found for appDocument mimetype');
        }
        const filePath = `${lyricFilePath}.preview.${extensions[0]}`;
        return filePath;
    }

    static getInstanceFromLyricFilePath(filePath: string) {
        const fileSource = FileSource.getInstance(filePath);
        const extensions = getMimetypeExtensions(Lyric.mimetypeName);
        if (!extensions.includes(fileSource.extension)) {
            return null;
        }
        return this.getInstance(this.toAppDocumentFilePath(filePath));
    }
}
