import { selectFiles } from '../../server/appHelpers';
import {
    getMimetypeExtensions,
    isSupportedMimetype,
} from '../../server/fileHelpers';
import { showAppContextMenu } from '../../context-menu/AppContextMenuComp';
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
            menuElement: 'New',
            onSelect: () => {
                canvasController.addNewTextItem();
            },
        },
        ...(copiedCanvasItems.length > 0
            ? [
                  {
                      menuElement: 'Paste',
                      onSelect: () => {
                          for (const copiedCanvasItem of copiedCanvasItems) {
                              canvasController.addNewItem(copiedCanvasItem);
                          }
                      },
                  },
              ]
            : []),
        {
            menuElement: 'Insert Medias',
            onSelect: () => {
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
                      menuElement: 'Paste Image',
                      onSelect: async () => {
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
            menuElement: 'Copy',
            onSelect: () => {
                navigator.clipboard.writeText(canvasItem.clipboardSerialize());
                showSimpleToast('Copied', 'Canvas item copied');
            },
        },
        {
            menuElement: 'Duplicate',
            onSelect: () => {
                canvasController.duplicate(canvasItem);
            },
        },
        {
            menuElement: 'Edit',
            onSelect: () => {
                handleCanvasItemEditing();
            },
        },
        {
            menuElement: 'Delete',
            onSelect: () => {
                canvasController.deleteItem(canvasItem);
            },
        },
    ]);
}
