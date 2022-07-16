import { CSSProperties } from 'react';
import CanvasItem from '../CanvasItem';
import { showCanvasItemContextMenu, useCIRefresh } from '../canvasHelpers';
import BoxEditorRenderText from './BoxEditorRenderText';
import BoxEditorTextArea from './BoxEditorTextArea';

export default function BoxEditorNormalMode({
    canvasItem,
}: {
    canvasItem: CanvasItem,
}) {
    const style: CSSProperties = {
        ...canvasItem.style,
        ...canvasItem.normalStyle,
    };
    useCIRefresh(canvasItem, ['edit', 'update']);
    return (
        <div className={`box-editor pointer ${canvasItem.isEditing ? 'editable' : ''}`}
            style={style}
            onContextMenu={async (e) => {
                e.stopPropagation();
                if (canvasItem.isEditing) {
                    canvasItem.isEditing = false;
                } else {
                    showCanvasItemContextMenu(e, canvasItem);
                }
            }}
            onKeyUp={(e) => {
                if (e.key === 'Escape' || (e.key === 'Enter' && e.ctrlKey)) {
                    canvasItem.isEditing = false;
                }
            }}
            onClick={async (e) => {
                e.stopPropagation();
                if (canvasItem.isEditing) {
                    return;
                }
                canvasItem.canvasController?.stopAllMods();
                canvasItem.isControlling = !canvasItem.isControlling;
                canvasItem.isSelected = canvasItem.isControlling;
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                canvasItem.isEditing = true;
            }}>
            {canvasItem.isEditing ? <BoxEditorTextArea color={style.color}
                text={canvasItem.props.text}
                setText={(text) => {
                    canvasItem.applyProps({ text });
                }} />
                : <BoxEditorRenderText text={canvasItem.props.text} />
            }
        </div>
    );
}
