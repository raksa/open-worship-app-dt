import { selectFiles } from '../../server/appHelpers';
import {
    getMimetypeExtensions,
    isSupportedMimetype,
} from '../../server/fileHelpers';
import { showAppContextMenu } from '../../others/AppContextMenuComp';
import CanvasItem from './CanvasItem';
import CanvasController from './CanvasController';
import { showSimpleToast } from '../../toast/toastHelpers';
import Canvas from './Canvas';

function checkClipboardIsImage(clipboardItem: ClipboardItem) {
    return clipboardItem.types.every((type) => {
        return isSupportedMimetype(type, 'image');
    });
}

export async function showCanvasContextMenu(
    event: any,
    canvasController: CanvasController,
) {
    const clipboardItems = await navigator.clipboard.read();
    const isPastingImage = clipboardItems.some((clipboardItem) => {
        return checkClipboardIsImage(clipboardItem);
    });
    const copiedCanvasItems = await Canvas.getCopiedCanvasItems();
    showAppContextMenu(event, [
        {
            menuTitle: 'New',
            onClick: () => {
                canvasController.addNewTextItem();
            },
        },
        ...(copiedCanvasItems.length > 0
            ? [
                  {
                      menuTitle: 'Paste',
                      onClick: () => {
                          for (const copiedCanvasItem of copiedCanvasItems) {
                              canvasController.addNewItem(copiedCanvasItem);
                          }
                      },
                  },
              ]
            : []),
        {
            menuTitle: 'Insert Medias',
            onClick: () => {
                const imageExts = getMimetypeExtensions('image');
                const videoExts = getMimetypeExtensions('video');
                const filePaths = selectFiles([
                    {
                        name: 'All Files',
                        extensions: [...imageExts, ...videoExts],
                    },
                ]);
                filePaths.forEach((filePath) => {
                    canvasController
                        .genNewMediaItemFromFilePath(filePath, event)
                        .then((newCanvasItem) => {
                            if (newCanvasItem) {
                                canvasController.addNewItem(newCanvasItem);
                            }
                        });
                });
            },
        },
        ...(isPastingImage
            ? [
                  {
                      menuTitle: 'Paste Image',
                      onClick: async () => {
                          const clipboardItems =
                              await navigator.clipboard.read();
                          for (const clipboardItem of clipboardItems) {
                              clipboardItem.types.forEach(async (type) => {
                                  if (!isSupportedMimetype(type, 'image')) {
                                      return;
                                  }
                                  const blob =
                                      await clipboardItem.getType(type);
                                  canvasController
                                      .genNewImageItemFromBlob(blob, event)
                                      .then((newCanvasItem) => {
                                          if (!newCanvasItem) {
                                              return;
                                          }
                                          canvasController.addNewItem(
                                              newCanvasItem,
                                          );
                                      });
                              });
                          }
                      },
                  },
              ]
            : []),
    ]);
}

export function showCanvasItemContextMenu(
    event: any,
    canvasController: CanvasController,
    canvasItem: CanvasItem<any>,
    handleCanvasItemEditing: () => void,
) {
    showAppContextMenu(event, [
        {
            menuTitle: 'Copy',
            onClick: () => {
                navigator.clipboard.writeText(canvasItem.clipboardSerialize());
                showSimpleToast('Copied', 'Canvas item copied');
            },
        },
        {
            menuTitle: 'Duplicate',
            onClick: () => {
                canvasController.duplicate(canvasItem);
            },
        },
        {
            menuTitle: 'Edit',
            onClick: () => {
                handleCanvasItemEditing();
            },
        },
        {
            menuTitle: 'Delete',
            onClick: () => {
                canvasController.deleteItem(canvasItem);
            },
        },
    ]);
}
