import './BoxEditorControllingModeComp.scss';

import {
    useCanvasItemContext,
    useCanvasItemPropsContext,
    useSetEditingCanvasItem,
} from '../CanvasItem';
import { BoxEditorNormalImageRender } from './BoxEditorNormalViewImageModeComp';
import { BoxEditorNormalTextRender } from './BoxEditorNormalViewTextModeComp';
import { BoxEditorNormalBibleRender } from './BoxEditorNormalViewBibleModeComp';
import { useCanvasControllerContext } from '../CanvasController';
import { BoxEditorNormalVideoRender } from './BoxEditorNormalViewVideoModeComp';
import { BENViewErrorRender } from './BoxEditorNormalViewErrorComp';
import { useKeyboardRegistering } from '../../../event/KeyboardEventListener';
import { useBoxEditorControllerContext } from '../../BoxEditorController';

function BoxEditorCanvasItemRender() {
    const canvasItem = useCanvasItemContext();
    switch (canvasItem.type) {
        case 'image':
            return <BoxEditorNormalImageRender />;
        case 'video':
            return <BoxEditorNormalVideoRender />;
        case 'text':
            return <BoxEditorNormalTextRender />;
        case 'bible':
            return <BoxEditorNormalBibleRender />;
        default:
            return <BENViewErrorRender />;
    }
}

export default function BoxEditorControllingModeComp() {
    // TODO: move box by left right up down key, shift&ctl
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext();
    const boxEditorController = useBoxEditorControllerContext();
    const handleCanvasItemEditing = useSetEditingCanvasItem();
    useKeyboardRegistering([{ key: 'Delete' }], () => {
        canvasController.deleteItem(canvasItem);
    });
    const props = useCanvasItemPropsContext();
    return (
        <div
            className="editor-controller-box-wrapper"
            ref={(div) => {
                if (div === null) {
                    return;
                }
                boxEditorController.initEvent(div);
                boxEditorController.onDone = async () => {
                    const info = boxEditorController.getInfo();
                    if (info !== null) {
                        canvasItem.applyProps(info);
                        canvasController.fireEditEvent(canvasItem);
                    }
                };
                return () => {
                    boxEditorController.release();
                };
            }}
            style={{
                width: '0',
                height: '0',
                top: `${props.top + props.height / 2}px`,
                left: `${props.left + props.width / 2}px`,
                transform: `rotate(${props.rotate}deg)`,
            }}
        >
            <div
                className={'app-box-editor controllable'}
                onClick={(event) => {
                    event.stopPropagation();
                }}
                onContextMenu={canvasController.genHandleContextMenuOpening(
                    canvasItem,
                    handleCanvasItemEditing.bind(null, canvasItem),
                )}
                onDoubleClick={(event) => {
                    event.stopPropagation();
                    handleCanvasItemEditing(canvasItem);
                }}
                style={{
                    border: '2px dashed green',
                    transform: 'translate(-50%, -50%)',
                    width: `${props.width}px`,
                    height: `${props.height}px`,
                    backgroundColor: props.backgroundColor ?? 'transparent',
                }}
            >
                <BoxEditorCanvasItemRender />
                <div className="tools">
                    <div
                        className={`object ${boxEditorController.rotatorCN}`}
                    />
                    <div className="rotate-link" />
                    {Object.keys(boxEditorController.resizeActorList).map(
                        (cn) => {
                            return <div key={cn} className={`object ${cn}`} />;
                        },
                    )}
                </div>
            </div>
        </div>
    );
}
