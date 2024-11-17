import { selectFiles } from '../../server/appHelper';
import {
    getMimetypeExtensions, isSupportedMimetype,
} from '../../server/fileHelper';
import { showAppContextMenu } from '../../others/AppContextMenu';
import CanvasItem from './CanvasItem';
import CanvasController from './CanvasController';

function checkClipboardIsImage(clipboardItem: ClipboardItem) {
    return clipboardItem.types.every((type) => {
        return isSupportedMimetype(type, 'image');
    });
}

export async function showCanvasContextMenu(event: any) {
    const canvasController = CanvasController.getInstance();
    const clipboardItems = await navigator.clipboard.read();
    const isPastingImage = clipboardItems.some((clipboardItem) => {
        return checkClipboardIsImage(clipboardItem);
    });
    showAppContextMenu(event, [
        {
            title: 'New',
            onClick: () => {
                canvasController.addNewTextItem();
            },
        },
        {
            title: 'Paste',
            disabled: canvasController.isCopied === null,
            onClick: () => {
                canvasController.paste();
            },
        },
        {
            title: 'Insert Medias',
            onClick: () => {
                const imageExts = getMimetypeExtensions('image');
                const videoExts = getMimetypeExtensions('video');
                const filePaths = selectFiles([
                    {
                        name: 'All Files',
                        extensions: [
                            ...imageExts,
                            ...videoExts,
                        ],
                    },
                ]);
                filePaths.forEach((filePath) => {
                    canvasController.genNewMediaItemFromFilePath(
                        filePath, event,
                    ).then((newCanvasItem) => {
                        if (newCanvasItem) {
                            canvasController.addNewItem(newCanvasItem);
                        }
                    });
                });
            },
        },
        ...(isPastingImage ? [
            {
                title: 'Paste Image',
                onClick: async () => {
                    const clipboardItems = await navigator.clipboard.read();
                    for (const clipboardItem of clipboardItems) {
                        clipboardItem.types.forEach(async (type) => {
                            if (!isSupportedMimetype(type, 'image')) {
                                return;
                            }
                            const blob = await clipboardItem.getType(type);
                            canvasController
                                .genNewImageItemFromBlob(blob, event)
                                .then((newCanvasItem) => {
                                    if (!newCanvasItem) {
                                        return;
                                    }
                                    canvasController.addNewItem(newCanvasItem);
                                });
                        })
                    }
                },
            },
        ] : []),
    ]);
}

export function showCanvasItemContextMenu(event: any,
    canvasItem: CanvasItem<any>,
) {
    const canvasController = CanvasController.getInstance();
    showAppContextMenu(event, [
        {
            title: 'Copy', onClick: () => {
                canvasController.copiedItem = canvasItem;
            },
        },
        {
            title: 'Duplicate', onClick: () => {
                canvasController.duplicate(canvasItem);
            },
        },
        {
            title: 'Edit', onClick: async () => {
                canvasController.stopAllMods();
                canvasController.setItemIsEditing(canvasItem, true);
            },
        },
        {
            title: 'Delete', onClick: () => {
                canvasController.deleteItem(canvasItem);
            },
        },
    ]);
}
