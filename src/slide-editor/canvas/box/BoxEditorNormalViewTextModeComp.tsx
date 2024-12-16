import { CSSProperties } from 'react';

import { useCanvasControllerContext } from '../CanvasController';
import {
    showCanvasItemContextMenu,
} from '../canvasCMHelpers';
import CanvasItemText, {
    CanvasItemTextPropsType,
} from '../CanvasItemText';
import { BENViewErrorRender } from './BoxEditorNormalViewErrorComp';
import { handleError } from '../../../helper/errorHelpers';
import { useCanvasItemContext } from '../CanvasItem';

export default function BoxEditorNormalViewTextModeComp({ style }: Readonly<{
    style: CSSProperties
}>) {
    const canvasItem = useCanvasItemContext();
    const canvasController = useCanvasControllerContext();
    return (
        <div className='app-box-editor pointer'
            style={style}
            onContextMenu={async (event) => {
                event.stopPropagation();
                showCanvasItemContextMenu(
                    event, canvasController, canvasItem,
                );
            }}
            onClick={async (event) => {
                event.stopPropagation();
                canvasController.stopAllMods();
                canvasController.setItemIsSelecting(canvasItem, true);
            }}>
            <BoxEditorNormalTextRender props={canvasItem.props} />
        </div>
    );
}

export function BoxEditorNormalTextRender({ props }: Readonly<{
    props: CanvasItemTextPropsType,
}>) {
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
