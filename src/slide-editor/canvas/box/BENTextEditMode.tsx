import { CSSProperties } from 'react';
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
