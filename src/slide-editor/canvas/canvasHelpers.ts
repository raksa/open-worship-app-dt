import { useEffect, useState } from 'react';
import { showAppContextMenu } from '../../others/AppContextMenu';
import { VAlignmentEnum, HAlignmentEnum } from './Canvas';
import CanvasController, { CCEventType } from './CanvasController';
import CanvasItem from './CanvasItem';

export function tooling2BoxProps(toolingData: ToolingType, state: {
    parentWidth: number, parentHeight: number, width: number, height: number,
}) {
    const { box } = toolingData;
    const boxProps: { top?: number, left?: number } = {};
    if (box) {
        if (box.verticalAlignment === VAlignmentEnum.Top) {
            boxProps.top = 0;
        } else if (box.verticalAlignment === VAlignmentEnum.Center) {
            boxProps.top = (state.parentHeight - state.height) / 2;
        } else if (box.verticalAlignment === VAlignmentEnum.Bottom) {
            boxProps.top = state.parentHeight - state.height;
        }
        if (box.horizontalAlignment === HAlignmentEnum.Left) {
            boxProps.left = 0;
        } else if (box.horizontalAlignment === HAlignmentEnum.Center) {
            boxProps.left = (state.parentWidth - state.width) / 2;
        } else if (box.horizontalAlignment === HAlignmentEnum.Right) {
            boxProps.left = state.parentWidth - state.width;
        }
    }

    return boxProps;
}

export type ToolingTextType = {
    color?: string,
    fontSize?: number,
    horizontalAlignment?: HAlignmentEnum,
    verticalAlignment?: VAlignmentEnum,
};
export type ToolingBoxType = {
    backgroundColor?: string,
    rotate?: number,
    horizontalAlignment?: HAlignmentEnum,
    verticalAlignment?: VAlignmentEnum,
};
export type ToolingType = {
    text?: ToolingTextType,
    box?: ToolingBoxType,
};

export function showCanvasContextMenu(e: any,
    canvasController: CanvasController) {
    showAppContextMenu(e, [
        {
            title: 'New',
            onClick: () => canvasController.addNewBox(),
        },
        {
            title: 'Paste',
            disabled: canvasController.isCopied === null,
            onClick: () => canvasController.paste(),
        },
    ]);
}

export function showCanvasItemContextMenu(e: any,
    canvasItem: CanvasItem,
) {
    showAppContextMenu(e, [
        {
            title: 'Copy', onClick: () => {
                const canvasController = canvasItem.canvasController;
                if (canvasController !== null) {
                    canvasController.copiedItem = canvasItem;
                }
            },
        },
        {
            title: 'Duplicate', onClick: () => {
                const canvasController = canvasItem.canvasController;
                canvasController?.duplicate(canvasItem);
            },
        },
        {
            title: 'Edit', onClick: async () => {
                canvasItem.canvasController?.stopAllMods();
                canvasItem.isEditing = true;
            },
        },
        {
            title: 'Delete', onClick: () => {
                const canvasController = canvasItem.canvasController;
                canvasController?.deleteItem(canvasItem);
            },
        },
    ]);
}

export function useCCRefresh(canvasController:CanvasController,
    eventTypes: CCEventType[]) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const regEvents = canvasController.registerEventListener(
            eventTypes, () => {
                setN(n + 1);
            });
        return () => {
            canvasController?.unregisterEventListener(regEvents);
        };
    }, [canvasController, n]);
}
export function useCIRefresh(canvasItem: CanvasItem,
    eventTypes: CCEventType[]) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const canvasController = canvasItem.canvasController;
        const regEvents = canvasController ? canvasController.registerEventListener(
            eventTypes, () => {
                setN(n + 1);
            }) : [];
        return () => {
            canvasController?.unregisterEventListener(regEvents);
        };
    }, [canvasItem, n]);
}

export function useCCScale(canvasController: CanvasController) {
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

export function useCIControl(canvasItem: CanvasItem) {
    const [isControlling, setIsControlling] = useState(canvasItem.isControlling);
    useEffect(() => {
        const canvasController = canvasItem.canvasController;
        const regEvents = canvasController ? canvasController.registerEventListener(
            ['control'], (item: CanvasItem) => {
                if (item.id === canvasItem.id) {
                    setIsControlling(canvasItem.isControlling);
                }
            }) : [];
        return () => {
            canvasController?.unregisterEventListener(regEvents);
        };
    }, [canvasItem]);
    return isControlling;
}