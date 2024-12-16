import './BoxEditorsControllingModeComp.scss';

import CanvasItem from '../CanvasItem';
import {
    showCanvasItemContextMenu,
} from '../canvasCMHelpers';
import { BoxEditorNormalImageRender } from './BoxEditorNormalViewImageModeComp';
import { BENTextRender } from './BoxEditorNormalViewTextModeComp';
import { BENBibleRender } from './BoxEditorNormalViewBibleModeComp';
import { useCanvasControllerContext } from '../CanvasController';
import { BENVideoRender } from './BoxEditorNormalViewVideoModeComp';
import { BENViewErrorRender } from './BoxEditorNormalViewErrorComp';
import {
    useKeyboardRegistering,
} from '../../../event/KeyboardEventListener';
import { useBoxEditorControllerContext } from '../../BoxEditorController';

export default function BoxEditorsControllingModeComp({ canvasItem }: Readonly<{
    canvasItem: CanvasItem<any>,
}>) {
    // TODO: move box by left right up down key, shift&ctl
    const canvasController = useCanvasControllerContext();
    const boxEditorController = useBoxEditorControllerContext();
    useKeyboardRegistering([{ key: 'Delete' }], () => {
        canvasController.deleteItem(canvasItem);
    });
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
                top: `${canvasItem.props.top + canvasItem.props.height / 2}px`,
                left: `${canvasItem.props.left + canvasItem.props.width / 2}px`,
                transform: `rotate(${canvasItem.props.rotate}deg)`,
                zIndex: canvasItem.props.zIndex,
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
                    width: `${canvasItem.props.width}px`,
                    height: `${canvasItem.props.height}px`,
                    backgroundColor: canvasItem.props.backgroundColor,
                }}>
                <BECRender canvasItem={canvasItem} />
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

function BECRender({ canvasItem }: Readonly<{
    canvasItem: CanvasItem<any>,
}>) {
    switch (canvasItem.type) {
        case 'image':
            return (
                <BoxEditorNormalImageRender props={canvasItem.props} />
            );
        case 'video':
            return (
                <BENVideoRender props={canvasItem.props} />
            );
        case 'text':
            return (
                <BENTextRender props={canvasItem.props} />
            );
        case 'bible':
            return (
                <BENBibleRender props={canvasItem.props} />
            );
        default:
            return (
                <BENViewErrorRender />
            );
    }
}
