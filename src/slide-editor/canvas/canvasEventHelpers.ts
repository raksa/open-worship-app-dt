import { useState } from 'react';

import { useAppEffect } from '../../helper/debuggerHelpers';
import CanvasController from './CanvasController';
import { CCEventType } from './canvasHelpers';
import CanvasItem from './CanvasItem';

export function useCanvasControllerEvents(
    canvasController: CanvasController,
    eventTypes: CCEventType[],
    callback?: (data: { canvasItem: CanvasItem<any> }) => void,
) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const regEvents = canvasController.registerEventListener(
            eventTypes, (data: { canvasItem: CanvasItem<any> }) => {
                setN(n + 1);
                callback?.(data);
            });
        return () => {
            canvasController.unregisterEventListener(regEvents);
        };
    }, [n]);
}

export function useSlideItemCanvasScale(canvasController: CanvasController) {
    const [scale, setScale] = useState(canvasController.scale);
    useAppEffect(() => {
        const regEvents = canvasController.registerEventListener(
            ['scale'], () => {
                setScale(canvasController.scale);
            },
        );
        return () => {
            canvasController.unregisterEventListener(regEvents);
        };
    });
    return scale;
}

export function useIsControlling(
    canvasController: CanvasController, canvasItem: CanvasItem<any>,
) {
    const [isControlling, setIsControlling] = useState(
        canvasItem.isControlling,
    );
    useAppEffect(() => {
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
