import './BoxEditor.scss';

import { useEffect } from 'react';
import { boxEditorController } from '../BoxEditorController';
import CanvasItem from './CanvasItem';
import CanvasController from './CanvasController';
import BoxEditorNormalMode from './BoxEditorNormalMode';
import BoxEditorControllingMod from './BoxEditorControllingMod';
import { useCCRefresh } from './canvasHelpers';

export type NewDataType = { [key: string]: any };
export function BoxEditor({
    canvasItem, canvasController, scale,
}: {
    canvasItem: CanvasItem, canvasController: CanvasController,
    scale: number,
}) {
    console.log(canvasController.canvasItems.indexOf(canvasItem));
    useCCRefresh(canvasController, ['select']);
    useEffect(() => {
        boxEditorController.setScaleFactor(scale);
    }, [scale]);
    boxEditorController.onDone = () => {
        const info = boxEditorController.getInfo();
        if (info !== null) {
            canvasItem.update(info);
            canvasController.fireUpdateEvent();
        }
    };
    return canvasItem.isSelected ?
        <BoxEditorControllingMod canvasItem={canvasItem}
            canvasController={canvasController} /> :
        <BoxEditorNormalMode canvasItem={canvasItem}
            canvasController={canvasController} />;
}
