import './BoxEditors.scss';

import { boxEditorController } from '../../BoxEditorController';
import CanvasItem from '../CanvasItem';
import BoxEditorsNormalMode from './BoxEditorsNormalMode';
import BoxEditorsControllingMode from './BoxEditorsControllingMode';
import { useIsControlling } from '../canvasEventHelpers';
import { useAppEffect } from '../../../helper/debuggerHelpers';
import { useCanvasControllerContext } from '../CanvasController';

export function BoxEditors({ canvasItem, scale }: Readonly<{
    canvasItem: CanvasItem<any>, scale: number,
}>) {
    const canvasController = useCanvasControllerContext();
    const isControlling = useIsControlling(canvasController, canvasItem);
    useAppEffect(() => {
        boxEditorController.setScaleFactor(scale);
    }, [scale]);
    // TODO: switch box by tab, shift
    // TODO: key => ctl+d, delete, copy&paste, paste across slideItem
    // TODO: ruler, snap
    // TODO: ctrl|alt resize => anchor center base
    if (isControlling) {
        return (
            <BoxEditorsControllingMode
                canvasItem={canvasItem}
            />
        );
    }
    return (
        <BoxEditorsNormalMode
            canvasItem={canvasItem}
        />
    );
}
