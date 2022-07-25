import './BoxEditor.scss';

import { useEffect } from 'react';
import { boxEditorController } from '../../BoxEditorController';
import CanvasItem from '../CanvasItem';
import BoxEditorNormalMode from './BoxEditorNormalMode';
import BoxEditorControllingMode from './BoxEditorControllingMode';
import { useCIControl } from '../canvasHelpers';

export type NewDataType = { [key: string]: any };
export function BoxEditor({
    canvasItem, scale,
}: {
    canvasItem: CanvasItem, scale: number,
}) {
    const isControlling = useCIControl(canvasItem);
    useEffect(() => {
        boxEditorController.setScaleFactor(scale);
    }, [scale]);
    // TODO: switch box by tab, shift
    // TODO: key => ctl+d, delete, copy&paste, paste across slideItem
    // TODO: ruler, snap
    // TODO: ctrl|alt resize => anchor center base
    if (isControlling) {
        return (
            <BoxEditorControllingMode
                canvasItem={canvasItem} />
        );
    }
    return (
        <BoxEditorNormalMode
            canvasItem={canvasItem} />
    );
}
