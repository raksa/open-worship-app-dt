import { useState } from 'react';

import { useAppEffect } from '../../helper/debuggerHelpers';
import CanvasController, {
    CanvasItemEventDataType, useCanvasControllerContext,
} from './CanvasController';
import { CanvasControllerEventType } from './canvasHelpers';
import CanvasItem, { useCanvasItemContext } from './CanvasItem';

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

export function useCanItemProperty(
    eventTypes: CanvasControllerEventType[],
    checkProperty: (canvasItem: CanvasItem<any>) => boolean,
) {
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext();
    const [isControlling, setIsControlling] = useState(
        checkProperty(canvasItem),
    );
    useAppEffect(() => {
        const regEvents = canvasController.itemRegisterEventListener(
            eventTypes, ({ canvasItems: items }) => {
                items.forEach((item) => {
                    if (item.id === canvasItem.id) {
                        setIsControlling(checkProperty(canvasItem),);
                    }
                });
            });
        return () => {
            canvasController.unregisterEventListener(regEvents);
        };
    }, [canvasItem]);
    return isControlling;
}

export function useCanvasItemIsControlling() {
    return useCanItemProperty(
        ['controlling'], (canvasItem) => {
            return canvasItem.isControlling;
        }
    );
}

export function useCanvasItemIsEditing() {
    return useCanItemProperty(
        ['text-editing'], (canvasItem) => {
            if (canvasItem.type === 'text') {
                return canvasItem.isEditing;
            }
            return false;
        }
    );
}
