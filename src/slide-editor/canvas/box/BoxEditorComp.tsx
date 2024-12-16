import './BoxEditorComp.scss';

import BoxEditorNormalModeComp from './BoxEditorNormalModeComp';
import BoxEditorControllingModeComp from './BoxEditorControllingModeComp';
import {
    useCanvasControllerRefreshEvents, useSlideItemCanvasScale,
} from '../canvasEventHelpers';
import BoxEditorController, {
    BoxEditorControllerContext,
} from '../../BoxEditorController';
import { useCanvasItemContext } from '../CanvasItem';

export function BoxEditorComp() {
    useCanvasControllerRefreshEvents();
    const scale = useSlideItemCanvasScale();
    const boxEditorController = new BoxEditorController(scale);
    const canvasItem = useCanvasItemContext();
    // TODO: switch box by tab, shift
    // TODO: key => ctl+d, delete, copy&paste, paste across slideItem
    // TODO: ruler, snap
    // TODO: ctrl|alt resize => anchor center base

    if (canvasItem.isControlling) {
        return (
            <BoxEditorControllerContext value={boxEditorController}>
                <BoxEditorControllingModeComp />
            </BoxEditorControllerContext>
        );
    }
    return (
        <BoxEditorNormalModeComp />
    );
}
