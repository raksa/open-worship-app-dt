import { CSSProperties } from 'react';

import { useCanvasControllerContext } from '../CanvasController';
import BoxEditorTextAreaComp from './BoxEditorTextAreaComp';
import {
    useCanvasItemContext,
    useCanvasItemPropsContext,
    useSetEditingCanvasItem,
} from '../CanvasItem';
import { CanvasItemTextPropsType } from '../CanvasItemText';

let timeoutId: any = null;
export default function BoxEditorNormalTextEditModeComp({
    style,
}: Readonly<{
    style: CSSProperties;
}>) {
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext();
    const handleTextSetting = (text: string) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = null;
            canvasItem.applyProps({ text });
            canvasController.applyEditItem(canvasItem);
        }, 1e3);
    };
    const props = useCanvasItemPropsContext<CanvasItemTextPropsType>();
    const handleCanvasItemEditing = useSetEditingCanvasItem();
    return (
        <div
            className="app-box-editor pointer editable"
            style={style}
            onClick={(event) => {
                event.stopPropagation();
            }}
            onContextMenu={async (event) => {
                event.stopPropagation();
                handleCanvasItemEditing(canvasItem, false);
            }}
            onKeyUp={(event) => {
                if (
                    event.key === 'Escape' ||
                    (event.key === 'Enter' && event.ctrlKey)
                ) {
                    handleCanvasItemEditing(canvasItem, false);
                }
            }}
        >
            <BoxEditorTextAreaComp props={props} setText={handleTextSetting} />
        </div>
    );
}
