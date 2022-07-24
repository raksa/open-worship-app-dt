import { CSSProperties } from 'react';
import {
    showCanvasItemContextMenu, useCIRefresh,
} from '../canvasHelpers';
import CanvasItemText from '../CanvasItemText';
import BoxEditorTextArea from './BoxEditorTextArea';

export default function BoxEditorNormalMode({
    canvasItemText,
}: {
    canvasItemText: CanvasItemText,
}) {
    const style: CSSProperties = {
        ...canvasItemText.getStyle(),
        ...canvasItemText.getBoxStyle(),
    };
    useCIRefresh(canvasItemText, ['edit', 'update']);
    if (!canvasItemText.isEditing) {
        return (
            <div className='box-editor pointer'
                style={style}
                onContextMenu={async (e) => {
                    e.stopPropagation();
                    showCanvasItemContextMenu(e, canvasItemText);
                }}
                onClick={async (e) => {
                    e.stopPropagation();
                    canvasItemText.canvasController?.stopAllMods();
                    canvasItemText.isControlling = true;
                    canvasItemText.isSelected = true;
                }}>
                <span dangerouslySetInnerHTML={{
                    __html: canvasItemText.props.text.split('\n').join('<br>'),
                }} />
            </div>
        );
    }
    return (
        <div className='box-editor pointer editable'
            style={style}
            onClick={(e) => {
                e.stopPropagation();
            }}
            onContextMenu={async (e) => {
                e.stopPropagation();
                canvasItemText.isEditing = false;
            }}
            onKeyUp={(e) => {
                if (e.key === 'Escape' || (e.key === 'Enter' && e.ctrlKey)) {
                    canvasItemText.isEditing = false;
                }
            }}>
            <BoxEditorTextArea
                color={style.color}
                text={canvasItemText.props.text}
                setText={(text) => {
                    canvasItemText.applyProps({ text });
                }} />
        </div>
    );
}
