import { CSSProperties, useCallback } from 'react';
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
    const setTextCallback = useCallback((text: string) => {
        canvasItemText.applyProps({ text });
        canvasController.fireUpdateEvent();
    }, [canvasItemText, canvasController]);
    return (
        <div className='box-editor pointer editable'
            style={style}
            onClick={(event) => {
                event.stopPropagation();
            }}
            onContextMenu={async (event) => {
                event.stopPropagation();
                canvasController.setItemIsEditing(canvasItemText, false);
            }}
            onKeyUp={(event) => {
                if (event.key === 'Escape' || (event.key === 'Enter'
                    && event.ctrlKey)) {
                    canvasController.setItemIsEditing(canvasItemText, false);
                }
            }}>
            <BoxEditorTextArea
                color={canvasItemText.props.color}
                text={canvasItemText.props.text}
                setText={setTextCallback} />
        </div>
    );
}
