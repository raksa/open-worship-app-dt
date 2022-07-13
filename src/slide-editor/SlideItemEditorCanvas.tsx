import { BoxEditor } from './BoxEditor';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { editorMapper } from './EditorBoxMapper';
import CanvasController, { EditingEnum } from './CanvasController';
import { showBoxContextMenu, showCanvasContextMenu } from './helps';
import { useEffect, useState } from 'react';
import CanvasItem from './CanvasItem';

export default function SlideItemEditorCanvas({
    canvasController, scale,
}: {
    canvasController: CanvasController,
    scale: number,
}) {
    const [localCanvasItems, setLocalCanvasItems] = useState<CanvasItem[]>(
        canvasController.canvasItems);
    useEffect(() => {
        const regEvents = canvasController.registerEditingEventListener(
            [EditingEnum.UPDATE], () => {
                setLocalCanvasItems(canvasController.newCanvasItems);
            });
        return () => {
            canvasController.unregisterEditingEventListener(regEvents);
        };
    }, [canvasController]);
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
                {localCanvasItems.map((canvasItem, i) => {
                    return <BoxEditor onUpdate={() => {
                        canvasController.canvasItems = localCanvasItems;
                    }}
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
