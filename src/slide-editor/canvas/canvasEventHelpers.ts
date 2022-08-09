import { useState, useEffect } from 'react';
import CanvasController from './CanvasController';
import { CCEventType } from './canvasHelpers';
import CanvasItem from './CanvasItem';

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
