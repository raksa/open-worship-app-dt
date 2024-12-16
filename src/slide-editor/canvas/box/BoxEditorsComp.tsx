import './BoxEditorsComp.scss';

import CanvasItem from '../CanvasItem';
import BoxEditorsNormalModeComp from './BoxEditorsNormalModeComp';
import BoxEditorsControllingModeComp from './BoxEditorsControllingModeComp';
import {
    useIsControlling, useSlideItemCanvasScale,
} from '../canvasEventHelpers';
import { useCanvasControllerContext } from '../CanvasController';
import BoxEditorController, {
    BoxEditorControllerContext,
} from '../../BoxEditorController';

export function BoxEditorsComp({ canvasItem }: Readonly<{
    canvasItem: CanvasItem<any>,
}>) {
    const scale = useSlideItemCanvasScale();
    const boxEditorController = new BoxEditorController(scale);
    const canvasController = useCanvasControllerContext();
    const isControlling = useIsControlling(canvasController, canvasItem);
    // TODO: switch box by tab, shift
    // TODO: key => ctl+d, delete, copy&paste, paste across slideItem
    // TODO: ruler, snap
    // TODO: ctrl|alt resize => anchor center base
    if (isControlling) {
        return (
            <BoxEditorControllerContext value={boxEditorController}>
                <BoxEditorsControllingModeComp
                    canvasItem={canvasItem}
                />
            </BoxEditorControllerContext>
        );
    }
    return (
        <BoxEditorsNormalModeComp
            canvasItem={canvasItem}
        />
    );
}
