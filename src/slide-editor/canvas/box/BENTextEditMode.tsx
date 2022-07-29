import { CSSProperties } from 'react';
import { canvasController } from '../CanvasController';
import CanvasItemText from '../CanvasItemText';
import BoxEditorTextArea from './BoxEditorTextArea';

export default function BENTextEditMode({
    canvasItemText, style,
}: {
    canvasItemText: CanvasItemText,
    style: CSSProperties
}) {
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
                if (e.key === 'Escape' || (e.key === 'Enter' && e.ctrlKey)) {
                    canvasController.setItemIsEditing(canvasItemText, false);
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
