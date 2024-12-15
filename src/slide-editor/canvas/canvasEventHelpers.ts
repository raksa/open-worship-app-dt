import { useState } from 'react';

import { useAppEffect } from '../../helper/debuggerHelpers';
import CanvasController, {
    CanvasItemEventDataType, useCanvasControllerContext,
} from './CanvasController';
import { CanvasControllerEventType } from './canvasHelpers';
import CanvasItem from './CanvasItem';

export function useCanvasControllerEvents(
    canvasController: CanvasController,
    eventTypes: CanvasControllerEventType[],
    callback?: (data: CanvasItemEventDataType) => void,
) {
    useAppEffect(() => {
        const regEvents = canvasController.itemRegisterEventListener(
            eventTypes, (data) => {
                callback?.(data);
            });
        return () => {
            canvasController.unregisterEventListener(regEvents);
        };
    }, [canvasController]);
}

export function useSlideItemCanvasScale() {
    const canvasController = useCanvasControllerContext();
    const [scale, setScale] = useState(canvasController.scale);
    useAppEffect(() => {
        const regEvents = canvasController.itemRegisterEventListener(
            ['scale'], () => {
                setScale(canvasController.scale);
            },
        );
        return () => {
            canvasController.unregisterEventListener(regEvents);
        };
    }, [canvasController]);
    return scale;
}

export function useIsControlling(
    canvasController: CanvasController, canvasItem: CanvasItem<any>,
) {
    const [isControlling, setIsControlling] = useState(
        canvasItem.isControlling,
    );
    useAppEffect(() => {
        const regEvents = canvasController.itemRegisterEventListener(
            ['control'], ({ canvasItems: items }) => {
                items.forEach((item) => {
                    if (item.id === canvasItem.id) {
                        setIsControlling(canvasItem.isControlling);
                    }
                });
            });
        return () => {
            canvasController.unregisterEventListener(regEvents);
        };
    }, [canvasItem]);
    return isControlling;
}
