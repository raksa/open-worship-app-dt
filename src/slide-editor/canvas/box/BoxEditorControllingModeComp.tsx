import './BoxEditorControllingModeComp.scss';

import { useCanvasItemContext } from '../CanvasItem';
import {
    showCanvasItemContextMenu,
} from '../canvasCMHelpers';
import { BoxEditorNormalImageRender } from './BoxEditorNormalViewImageModeComp';
import { BoxEditorNormalTextRender } from './BoxEditorNormalViewTextModeComp';
import { BoxEditorNormalBibleRender } from './BoxEditorNormalViewBibleModeComp';
import { useCanvasControllerContext } from '../CanvasController';
import { BoxEditorNormalVideoRender } from './BoxEditorNormalViewVideoModeComp';
import { BENViewErrorRender } from './BoxEditorNormalViewErrorComp';
import {
    useKeyboardRegistering,
} from '../../../event/KeyboardEventListener';
import { useBoxEditorControllerContext } from '../../BoxEditorController';

function BoxEditorCanvasItemRender() {
    const canvasItem = useCanvasItemContext();
    switch (canvasItem.type) {
        case 'image':
            return (
                <BoxEditorNormalImageRender />
            );
        case 'video':
            return (
                <BoxEditorNormalVideoRender />
            );
        case 'text':
            return (
                <BoxEditorNormalTextRender />
            );
        case 'bible':
            return (
                <BoxEditorNormalBibleRender />
            );
        default:
            return (
                <BENViewErrorRender />
            );
    }
}

export default function BoxEditorControllingModeComp() {
    // TODO: move box by left right up down key, shift&ctl
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext();
    const boxEditorController = useBoxEditorControllerContext();
    useKeyboardRegistering([{ key: 'Delete' }], () => {
        canvasController.deleteItem(canvasItem);
    });
    const { props } = canvasItem;
    return (
        <div className='editor-controller-box-wrapper'
            ref={(div) => {
                if (div !== null) {
                    boxEditorController.release();
                    boxEditorController.initEvent(div);
                    boxEditorController.onDone = () => {
                        const info = boxEditorController.getInfo();
                        if (info !== null) {
                            canvasItem.applyProps(info);
                            canvasController.fireUpdateEvent(canvasItem);
                        }
                    };
                }
            }}
            style={{
                width: '0',
                height: '0',
                top: `${props.top + props.height / 2}px`,
                left: `${props.left + props.width / 2}px`,
                transform: `rotate(${props.rotate}deg)`,
                zIndex: props.zIndex,
            }}>
            <div className={'app-box-editor controllable'}
                onClick={(event) => {
                    event.stopPropagation();
                }}
                onContextMenu={(event) => {
                    event.stopPropagation();
                    showCanvasItemContextMenu(
                        event, canvasController, canvasItem,
                    );
                }}
                onDoubleClick={(event) => {
                    event.stopPropagation();
                    if (canvasItem.type === 'text') {
                        canvasController.stopAllMods();
                        canvasController.setItemIsEditing(canvasItem, true);
                    }
                }}
                style={{
                    border: canvasItem.isSelected ?
                        '2px dashed green' : undefined,
                    transform: 'translate(-50%, -50%)',
                    width: `${props.width}px`,
                    height: `${props.height}px`,
                    backgroundColor: props.backgroundColor,
                }}>
                <BoxEditorCanvasItemRender />
                <div className='tools'>
                    <div className={
                        `object ${boxEditorController.rotatorCN}`
                    } />
                    <div className='rotate-link' />
                    {Object.keys(boxEditorController.resizeActorList).map(
                        (cn) => {
                            return (
                                <div key={cn} className={`object ${cn}`} />
                            );
                        },
                    )
                    }
                </div>
            </div>
        </div>
    );
}

