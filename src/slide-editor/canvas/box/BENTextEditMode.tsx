import { CSSProperties } from 'react';
import CanvasController from '../CanvasController';
import CanvasItemText from '../CanvasItemText';
import BoxEditorTextArea from './BoxEditorTextArea';

export default function BENTextEditMode({
    canvasItemText, style,
}: {
    canvasItemText: CanvasItemText,
    style: CSSProperties
}) {
    const canvasController = CanvasController.getInstance();
    return (
        <div className='box-editor pointer editable'
            style={style}
            onClick={(e) => {
                e.stopPropagation();
            }}
            onContextMenu={async (e) => {
                e.stopPropagation();
                canvasController.setItemIsEditing(canvasItemText, false);
            }}
            onKeyUp={(e) => {
                if (e.key === 'Escape' || (e.key === 'Enter'
                    && e.ctrlKey)) {
                    canvasController.setItemIsEditing(canvasItemText, false);
                }
            }}>
            <BoxEditorTextArea
                color={canvasItemText.props.color}
                text={canvasItemText.props.text}
                setText={(text) => {
                    canvasItemText.applyProps({ text });
                    canvasController.fireUpdateEvent();
                }} />
        </div>
    );
}
