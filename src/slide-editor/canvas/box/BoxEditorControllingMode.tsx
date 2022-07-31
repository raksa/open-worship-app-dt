import './BoxEditorControllingMode.scss';

import { boxEditorController } from '../../BoxEditorController';
import CanvasItem from '../CanvasItem';
import {
    showCanvasItemContextMenu, useCCRefresh,
} from '../canvasHelpers';
import { BENImageRender } from './BENViewImageMode';
import { BENTextRender } from './BENViewTextMode';
import { BENBibleRender } from './BENViewBibleMode';
import { canvasController } from '../CanvasController';

export default function BoxEditorControllingMode({ canvasItem }: {
    canvasItem: CanvasItem<any>,
}) {
    // TODO: move box by left right up down key, shift&ctl
    useCCRefresh(['update']);
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
            <div className={'box-editor controllable'}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                onContextMenu={(e) => {
                    e.stopPropagation();
                    showCanvasItemContextMenu(e, canvasItem);
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (canvasItem.isTypeText) {
                        canvasController.stopAllMods();
                        canvasController.setItemIsEditing(canvasItem, true);
                    }
                }}
                style={{
                    border: canvasItem.isSelected ? '2px dashed green' : undefined,
                    transform: 'translate(-50%, -50%)',
                    width: `${canvasItem.props.width}px`,
                    height: `${canvasItem.props.height}px`,
                    backgroundColor: canvasItem.props.backgroundColor,
                }}>
                <BECRender canvasItem={canvasItem} />
                <div className='tools'>
                    <div className={`object ${boxEditorController.rotatorCN}`} />
                    <div className='rotate-link' />
                    {Object.keys(boxEditorController.resizeActorList)
                        .map((cn, i) => <div key={`${i}`}
                            className={`object ${cn}`} />)
                    }
                </div>
            </div>
        </div>
    );
}

function BECRender({ canvasItem }: {
    canvasItem: CanvasItem<any>,
}) {
    if (canvasItem.isTypeImage) {
        return (
            <BENImageRender props={canvasItem.props} />
        );
    }
    if (canvasItem.isTypeText) {
        return (
            <BENTextRender props={canvasItem.props} />
        );
    }
    if (canvasItem.isTypeBible) {
        return (
            <BENBibleRender props={canvasItem.props} />
        );
    }
    return null;
}
