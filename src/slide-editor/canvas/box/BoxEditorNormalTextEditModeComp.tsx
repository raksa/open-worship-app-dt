import { CSSProperties } from 'react';

import { useCanvasControllerContext } from '../CanvasController';
import BoxEditorTextAreaComp from './BoxEditorTextAreaComp';
import { useCanvasItemContext } from '../CanvasItem';


export default function BoxEditorNormalTextEditModeComp({ style }: Readonly<{
    style: CSSProperties
}>) {
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext();
    const handleTextSetting = (text: string) => {
        canvasItem.applyProps({ text });
        canvasController.fireUpdateEvent(canvasItem);
    };
    const { props } = canvasItem;
    return (
        <div className='app-box-editor pointer editable'
            style={style}
            onClick={(event) => {
                event.stopPropagation();
            }}
            onContextMenu={async (event) => {
                event.stopPropagation();
                canvasController.setItemIsEditing(canvasItem, false);
            }}
            onKeyUp={(event) => {
                if (
                    event.key === 'Escape' ||
                    (event.key === 'Enter' && event.ctrlKey)
                ) {
                    canvasController.setItemIsEditing(canvasItem, false);
                }
            }}>
            <BoxEditorTextAreaComp
                color={props.color}
                text={props.text}
                setText={handleTextSetting}
            />
        </div>
    );
}
