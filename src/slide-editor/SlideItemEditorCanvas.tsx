import { BoxEditor } from './BoxEditor';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { editorMapper } from './EditorBoxMapper';
import CanvasController from './CanvasController';
import { showBoxContextMenu, showCanvasContextMenu } from './helps';

export default function SlideItemEditorCanvas({
    canvasController, scale,
}: {
    canvasController: CanvasController,
    scale: number,
}) {
    useKeyboardRegistering({
        key: KeyEnum.Escape,
    }, () => editorMapper.stopAllModes());
    const canvas = canvasController.canvas;
    return (
        <>
            <div className='editor blank-bg border-white-round' style={{
                width: `${canvas.width}px`,
                height: `${canvas.height}px`,
                transform: 'translate(-50%, -50%)',
            }}
                onContextMenu={(e) => showCanvasContextMenu(e, canvasController)}
                onDoubleClick={() => editorMapper.stopAllModes()} >
                {canvasController.canvasItems.map((canvasItem, i) => {
                    return <BoxEditor
                        scale={scale} key={`${i}`}
                        onContextMenu={(e) => showBoxContextMenu(e,
                            canvasController, i, canvasItem)}
                        ref={(be) => {
                            editorMapper.setEditor(`${i}`, be);
                        }}
                        canvasItem={canvasItem} />;
                })}
            </div>
        </>
    );
}
