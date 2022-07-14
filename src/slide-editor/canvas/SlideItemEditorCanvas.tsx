import { BoxEditor } from './BoxEditor';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import CanvasController from './CanvasController';
import { showCanvasContextMenu } from './canvasHelpers';

export default function SlideItemEditorCanvas({
    canvasController, scale,
}: {
    canvasController: CanvasController,
    scale: number,
}) {
    useKeyboardRegistering({
        key: KeyEnum.Escape,
    }, () => {
        canvasController.stopAllMod();
    });
    const canvas = canvasController.canvas;
    return (
        <>
            <div className='editor blank-bg border-white-round' style={{
                width: `${canvas.width}px`,
                height: `${canvas.height}px`,
                transform: 'translate(-50%, -50%)',
            }}
                onContextMenu={(e) => showCanvasContextMenu(e, canvasController)}
                onDoubleClick={() => {
                    canvasController.stopAllMod();
                }} >
                {canvasController.canvasItems.map((canvasItem, i) => {
                    console.log(canvasController.canvasItems.indexOf(canvasItem));
                    return <BoxEditor scale={scale} key={`${i}`}
                        canvasItem={canvasItem}
                        canvasController={canvasController} />;
                })}
            </div>
        </>
    );
}
