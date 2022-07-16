import { BoxEditor } from './box/BoxEditor';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import CanvasController from './CanvasController';
import {
    showCanvasContextMenu,
    useCCRefresh,
} from './canvasHelpers';

export default function SlideItemEditorCanvas({
    canvasController, scale,
}: {
    canvasController: CanvasController,
    scale: number,
}) {
    const canvasItems = canvasController.canvas.canvasItems;
    useCCRefresh(canvasController, ['update']);
    useKeyboardRegistering({ key: KeyEnum.Escape }, () => {
        canvasController.stopAllMods();
    });
    return (
        <div className='editor-container w-100 h-100'>
            <div className='overflow-hidden' style={{
                width: `${canvasController.canvas.width * scale + 20}px`,
                height: `${canvasController.canvas.height * scale + 20}px`,
            }}>
                <div className='w-100 h-100' style={{
                    transform: `scale(${scale.toFixed(1)}) translate(50%, 50%)`,
                }}>
                    <div className='editor blank-bg border-white-round' style={{
                        width: `${canvasController.canvas.width}px`,
                        height: `${canvasController.canvas.height}px`,
                        transform: 'translate(-50%, -50%)',
                    }}
                        onContextMenu={(e) => showCanvasContextMenu(e, canvasController)}
                        onDoubleClick={() => {
                            canvasController.stopAllMods();
                        }} >
                        {canvasItems.map((canvasItem, i) => {
                            return <BoxEditor scale={scale} key={`${i}`}
                                canvasItem={canvasItem} />;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
