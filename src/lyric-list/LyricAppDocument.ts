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
import { renderLyricSlideHtmlList } from './markdownHelpers';
import { CanvasItemTextPropsType } from '../slide-editor/canvas/CanvasItemText';

export default class LyricAppDocument extends AppDocument {
    static readonly mimetypeName: MimetypeNameType = 'appDocument';
    isEditable = false;

    async getSlides() {
        const display = getDefaultScreenDisplay();
        const offsetPercentage = 5;
        const left = Math.floor(
            display.bounds.width * (offsetPercentage / 100),
        );
        const top = Math.floor(
            display.bounds.height * (offsetPercentage / 100),
        );
        const lyric = Lyric.getInstance(
            LyricAppDocument.toLyricFilePath(this.filePath),
        );
        const htmlDataList = await renderLyricSlideHtmlList(lyric);
        return htmlDataList.map((htmlData, i) => {
            return new LyricSlide(this.filePath, {
                id: i,
                canvasItems: htmlData.html
                    ? [
                          {
                              text: htmlData.html,
                              color: '#FFFFFFFF',
                              fontSize: 90,
                              fontFamily: 'Battambang',
                              fontWeight: null,
                              textHorizontalAlignment: 'center',
                              textVerticalAlignment: 'center',
                              id: 0,
                              top,
                              left,
                              backgroundColor: '#0000008B',
                              width: Math.floor(
                                  display.bounds.width - left * 2,
                              ),
                              height: Math.floor(
                                  display.bounds.height - top * 2,
                              ),
                              rotate: 0,
                              horizontalAlignment: 'center',
                              verticalAlignment: 'center',
                              type: 'html',
                          } as CanvasItemTextPropsType,
                      ]
                    : [],
                metadata: {
                    width: display.bounds.width,
                    height: display.bounds.height,
                    uuid: htmlData.id,
                } as any,
            });
        });
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

    static toLyricFilePath(appDocumentFilePath: string) {
        const extensions = getMimetypeExtensions(this.mimetypeName);
        if (extensions.length === 0) {
            throw new Error('No extensions found for appDocument mimetype');
        }
        const filePath = appDocumentFilePath.replace(
            new RegExp(`\\.preview\\.${extensions[0]}$`),
            '',
        );
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
