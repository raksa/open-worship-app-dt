import './BoxEditorComp.scss';

import BoxEditorNormalModeComp from './BoxEditorNormalModeComp';
import BoxEditorControllingModeComp from './BoxEditorControllingModeComp';
import { useSlideItemCanvasScale } from '../canvasEventHelpers';
import BoxEditorController, {
    BoxEditorControllerContext,
} from '../../BoxEditorController';
import { useIsCanvasItemSelected } from '../CanvasItem';

export function BoxEditorComp() {
    const scale = useSlideItemCanvasScale();
    const boxEditorController = new BoxEditorController(scale);
    const isSelected = useIsCanvasItemSelected();
    // TODO: switch box by tab, shift
    // TODO: key => ctl+d, delete, copy&paste, paste across slideItem
    // TODO: ruler, snap
    // TODO: ctrl|alt resize => anchor center base

    if (isSelected) {
        return (
            <BoxEditorControllerContext value={boxEditorController}>
                <BoxEditorControllingModeComp />
            </BoxEditorControllerContext>
        );
    }
    return <BoxEditorNormalModeComp />;
}
