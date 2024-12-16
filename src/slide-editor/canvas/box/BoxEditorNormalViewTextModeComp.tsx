import { CSSProperties } from 'react';

import { useCanvasControllerContext } from '../CanvasController';
import CanvasItemText from '../CanvasItemText';
import { BENViewErrorRender } from './BoxEditorNormalViewErrorComp';
import { handleError } from '../../../helper/errorHelpers';
import { useCanvasItemContext } from '../CanvasItem';

export default function BoxEditorNormalViewTextModeComp({ style }: Readonly<{
    style: CSSProperties
}>) {
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext();
    return (
        <div className='app-box-editor pointer'
            style={style}
            onContextMenu={
                canvasController.genHandleContextMenuOpening(canvasItem)
            }
            onClick={canvasController.genHandleEventClicking(canvasItem)}>
            <BoxEditorNormalTextRender />
        </div>
    );
}

export function BoxEditorNormalTextRender() {
    const canvasItem = useCanvasItemContext();
    const { props } = canvasItem;
    try {
        CanvasItemText.validate(props);
    } catch (error) {
        handleError(error);
        return (
            <BENViewErrorRender />
        );
    }
    const htmlText = props.text.replace(/\n/g, '<br />');
    return (
        <div className='w-100 h-100'
            style={CanvasItemText.genStyle(props)}
            dangerouslySetInnerHTML={{
                __html: htmlText,
            }}
        />
    );
}
