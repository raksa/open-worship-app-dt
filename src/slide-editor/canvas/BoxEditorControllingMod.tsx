import './EditorControllerBoxWrapper.scss';

import { boxEditorController } from '../BoxEditorController';
import CanvasItem from './CanvasItem';
import CanvasController from './CanvasController';
import { showBoxContextMenu } from './canvasHelpers';
import BoxEditorRenderText from './BoxEditorRenderText';

export default function BoxEditorControllingMod({
    canvasItem, canvasController,
}: {
    canvasItem: CanvasItem,
    canvasController: CanvasController,
}) {
    return (
        <div className="editor-controller-box-wrapper"
            ref={(div) => {
                if (div !== null) {
                    boxEditorController.initEvent(div);
                }
            }}
            style={{
                width: '0',
                height: '0',
                top: `${canvasItem.top + canvasItem.height / 2}px`,
                left: `${canvasItem.left + canvasItem.width / 2}px`,
                transform: `rotate(${canvasItem.rotate}deg)`,
                zIndex: canvasItem.zIndex,
            }}>
            <div className={'box-editor controllable'}
                onContextMenu={(e) => {
                    e.stopPropagation();
                    showBoxContextMenu(e, canvasController, canvasItem);
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    canvasItem.isEditing = true;
                }}
                style={{
                    transform: 'translate(-50%, -50%)',
                    width: `${canvasItem.width}px`, height: `${canvasItem.height}px`,
                }}>
                <div className='w-100 h-100' style={canvasItem.style}>
                    <BoxEditorRenderText text={canvasItem.text} />
                </div>
                <div className='tools'>
                    <div className={`object ${boxEditorController.rotatorCN}`} />
                    <div className="rotate-link" />
                    {Object.keys(boxEditorController.resizeActorList)
                        .map((cn, i) => <div key={`${i}`}
                            className={`object ${cn}`} />)
                    }
                </div>
            </div>
        </div>
    );
}
