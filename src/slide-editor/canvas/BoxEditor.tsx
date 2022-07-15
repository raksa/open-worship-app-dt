import './BoxEditor.scss';

import { useEffect } from 'react';
import { boxEditorController } from '../BoxEditorController';
import CanvasItem from './CanvasItem';
import BoxEditorNormalMode from './BoxEditorNormalMode';
import BoxEditorControllingMod from './BoxEditorControllingMod';
import { useCIControl } from './canvasHelpers';

export type NewDataType = { [key: string]: any };
export function BoxEditor({
    canvasItem, scale,
}: {
    canvasItem: CanvasItem, scale: number,
}) {
    const isControlling = useCIControl(canvasItem);
    const canvasController = canvasItem.canvasController;
    if (canvasController === null) {
        return null;
    }
    useEffect(() => {
        boxEditorController.setScaleFactor(scale);
    }, [scale]);
    boxEditorController.onClick = () => {
        canvasItem.isControlling = false;
    };
    boxEditorController.onDone = () => {
        const info = boxEditorController.getInfo();
        if (info !== null) {
            canvasItem.applyProps(info);
            canvasController.fireUpdateEvent();
        }
    };
    return isControlling ?
        <BoxEditorControllingMod canvasItem={canvasItem} /> :
        <BoxEditorNormalMode canvasItem={canvasItem} />;
}
