import { CSSProperties } from 'react';

import { useCanvasControllerContext } from '../CanvasController';
import BoxEditorTextAreaComp from './BoxEditorTextAreaComp';
import {
    useCanvasItemContext,
    useCanvasItemPropsContext,
    useSetEditingCanvasItem,
} from '../CanvasItem';
import { CanvasItemTextPropsType } from '../CanvasItemText';
import { genTimeoutAttempt } from '../../../helper/helpers';

const attemptTimeout = genTimeoutAttempt(1e3);
export default function BoxEditorNormalTextEditModeComp({
    style,
}: Readonly<{
    style: CSSProperties;
}>) {
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext();
    const handleTextSetting = (text: string) => {
        attemptTimeout(() => {
            canvasItem.applyProps({ text });
            canvasController.applyEditItem(canvasItem);
        });
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
