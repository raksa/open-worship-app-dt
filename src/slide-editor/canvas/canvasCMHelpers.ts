import { selectFiles } from '../../server/appHelper';
import { getMimetypeExtensions } from '../../server/fileHelper';
import FileSource from '../../helper/FileSource';
import { showAppContextMenu } from '../../others/AppContextMenu';
import CanvasItem from './CanvasItem';
import CanvasController from './CanvasController';

export function showCanvasContextMenu(e: any) {
    const canvasController = CanvasController.getInstance();
    showAppContextMenu(e, [
        {
            title: 'New',
            onClick: () => canvasController.addNewTextItem(),
        },
        {
            title: 'Paste',
            disabled: canvasController.isCopied === null,
            onClick: () => canvasController.paste(),
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
                    const fileSource = FileSource.getInstance(filePath);
                    canvasController.addNewMediaItem(fileSource, e);
                });
            },
        },
    ]);
}

export function showCanvasItemContextMenu(e: any,
    canvasItem: CanvasItem<any>,
) {
    const canvasController = CanvasController.getInstance();
    showAppContextMenu(e, [
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
