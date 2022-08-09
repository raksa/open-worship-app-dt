import { useEffect, useState } from 'react';
import { selectFiles } from '../../server/appHelper';
import { getMimetypeExtensions } from '../../server/fileHelper';
import FileSource from '../../helper/FileSource';
import { showAppContextMenu } from '../../others/AppContextMenu';
import CanvasController, { CCEventType } from './CanvasController';
import CanvasItem from './CanvasItem';
import { AppColorType } from '../../others/ColorPicker';
import { HAlignmentType, VAlignmentType } from './Canvas';

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
                    { name: 'Images', extensions: imageExts },
                    { name: 'Movies', extensions: videoExts },
                ]);
                filePaths.forEach((filePath) => {
                    const fileSource = FileSource.genFileSource(filePath);
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

export function useCCEvents(eventTypes: CCEventType[]) {
    const [n, setN] = useState(0);
    const canvasController = CanvasController.getInstance();
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
    const canvasController = CanvasController.getInstance();
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
    const canvasController = CanvasController.getInstance();
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

export type ToolingBoxType = {
    backgroundColor?: AppColorType | null,
    rotate?: number,
    horizontalAlignment?: HAlignmentType,
    verticalAlignment?: VAlignmentType,
};
export const canvasItemList = [
    'text', 'image', 'video', 'audio', 'bible', 'error',
] as const;
export type CanvasItemKindType = typeof canvasItemList[number];

export function genTextDefaultBoxStyle(width: number = 700,
    height: number = 400) {
    return {
        id: -1,
        top: 279,
        left: 356,
        backgroundColor: '#FF00FF8b' as AppColorType,
        width,
        height,
        rotate: 0,
        horizontalAlignment: 'center' as HAlignmentType,
        verticalAlignment: 'center' as VAlignmentType,
    };
}

export type CanvasItemPropsType = {
    id: number,
    top: number,
    left: number,
    rotate: number,
    width: number,
    height: number,
    horizontalAlignment: HAlignmentType,
    verticalAlignment: VAlignmentType,
    backgroundColor: AppColorType | null,
    type: CanvasItemKindType,
};
