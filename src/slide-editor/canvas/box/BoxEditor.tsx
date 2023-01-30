import './BoxEditor.scss';

import { boxEditorController } from '../../BoxEditorController';
import CanvasItem from '../CanvasItem';
import BoxEditorNormalMode from './BoxEditorNormalMode';
import BoxEditorControllingMode from './BoxEditorControllingMode';
import { useCIControl } from '../canvasEventHelpers';
import { useAppEffect } from '../../../helper/debuggerHelpers';

export function BoxEditor({
    canvasItem, scale,
}: {
    canvasItem: CanvasItem<any>, scale: number,
}) {
    const isControlling = useCIControl(canvasItem);
    useAppEffect(() => {
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
