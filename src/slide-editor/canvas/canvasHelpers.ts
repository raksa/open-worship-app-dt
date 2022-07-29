import { useEffect, useState } from 'react';
import { selectFiles } from '../../helper/appHelper';
import { getMimetypeExtensions } from '../../helper/fileHelper';
import FileSource from '../../helper/FileSource';
import { showAppContextMenu } from '../../others/AppContextMenu';
import { VAlignmentType, HAlignmentType } from './Canvas';
import { canvasController, CCEventType } from './CanvasController';
import CanvasItem from './CanvasItem';

export function tooling2BoxProps(boxData: ToolingBoxType, state: {
    parentWidth: number, parentHeight: number,
    width: number, height: number,
}) {
    const boxProps: { top?: number, left?: number } = {};
    if (boxData) {
        if (boxData.verticalAlignment === 'top') {
            boxProps.top = 0;
        } else if (boxData.verticalAlignment === 'center') {
            boxProps.top = (state.parentHeight - state.height) / 2;
        } else if (boxData.verticalAlignment === 'bottom') {
            boxProps.top = state.parentHeight - state.height;
        }
        if (boxData.horizontalAlignment === 'left') {
            boxProps.left = 0;
        } else if (boxData.horizontalAlignment === 'center') {
            boxProps.left = (state.parentWidth - state.width) / 2;
        } else if (boxData.horizontalAlignment === 'right') {
            boxProps.left = state.parentWidth - state.width;
        }
    }
    return boxProps;
}

export type CanvasItemType = 'text' | 'image' | 'video' | 'audio' | 'bible';

export type ToolingBoxType = {
    backgroundColor?: string,
    rotate?: number,
    horizontalAlignment?: HAlignmentType,
    verticalAlignment?: VAlignmentType,
};

export function showCanvasContextMenu(e: any) {
    showAppContextMenu(e, [
        {
            title: 'New',
            onClick: () => canvasController.addNewTextBox(),
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
                    { name: 'Images', extensions: imageExts },
                    { name: 'Movies', extensions: videoExts },
                ]);
                filePaths.forEach((filePath) => {
                    const fileSource = FileSource.genFileSource(filePath);
                    canvasController.addNewMedia(fileSource, e);
                });
            },
        },
    ]);
}

export function showCanvasItemContextMenu(e: any,
    canvasItem: CanvasItem<any>,
) {
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

export function useCCRefresh(eventTypes: CCEventType[]) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const regEvents = canvasController.registerEventListener(
            eventTypes, () => {
                setN(n + 1);
            });
        return () => {
            canvasController.unregisterEventListener(regEvents);
        };
    }, [n]);
}

export function useCCScale() {
    const [scale, setScale] = useState(canvasController.scale);
    useEffect(() => {
        const regEvents = canvasController.registerEventListener(['scale'], () => {
            setScale(canvasController.scale);
        });
        return () => {
            canvasController.unregisterEventListener(regEvents);
        };
    });
    return scale;
}

export function useCIControl(canvasItem: CanvasItem<any>) {
    const [isControlling, setIsControlling] = useState(canvasItem.isControlling);
    useEffect(() => {
        const regEvents = canvasController.registerEventListener(
            ['control'], (item: CanvasItem<any>) => {
                if (item.id === canvasItem.id) {
                    setIsControlling(canvasItem.isControlling);
                }
            });
        return () => {
            canvasController.unregisterEventListener(regEvents);
        };
    }, [canvasItem]);
    return isControlling;
}
