import { BoxEditor } from './BoxEditor';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import CanvasController from './CanvasController';
import {
    showCanvasContextMenu,
    useCCCanvasItems,
} from './canvasHelpers';

export default function SlideItemEditorCanvas({
    canvasController, scale,
}: {
    canvasController: CanvasController,
    scale: number,
}) {
    const canvasItems = useCCCanvasItems(canvasController);
    useKeyboardRegistering({
        key: KeyEnum.Escape,
    }, () => {
        canvasController.stopAllMod();
    });
    return (
        <>
            <div className='editor blank-bg border-white-round' style={{
                width: `${canvasController.canvas.width}px`,
                height: `${canvasController.canvas.height}px`,
                transform: 'translate(-50%, -50%)',
            }}
                onContextMenu={(e) => showCanvasContextMenu(e, canvasController)}
                onDoubleClick={() => {
                    canvasController.stopAllMod();
                }} >
                {canvasItems.map((canvasItem, i) => {
                    return <BoxEditor scale={scale} key={`${i}`}
                        canvasItem={canvasItem} />;
                })}
            </div>
        </>
    );
}
