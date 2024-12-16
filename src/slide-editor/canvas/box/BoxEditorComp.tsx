import './BoxEditorComp.scss';

import BoxEditorNormalModeComp from './BoxEditorNormalModeComp';
import BoxEditorControllingModeComp from './BoxEditorControllingModeComp';
import {
    useCanvasItemIsControlling, useSlideItemCanvasScale,
} from '../canvasEventHelpers';
import BoxEditorController, {
    BoxEditorControllerContext,
} from '../../BoxEditorController';

export function BoxEditorComp() {
    const scale = useSlideItemCanvasScale();
    const boxEditorController = new BoxEditorController(scale);
    const isControlling = useCanvasItemIsControlling();
    // TODO: switch box by tab, shift
    // TODO: key => ctl+d, delete, copy&paste, paste across slideItem
    // TODO: ruler, snap
    // TODO: ctrl|alt resize => anchor center base
    if (isControlling) {
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
