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

export default function BoxEditorNormalViewTextModeComp({
    canvasItemText, style,
}: Readonly<{
    canvasItemText: CanvasItemText,
    style: CSSProperties
}>) {
    const canvasController = useCanvasControllerContext();
    return (
        <div className='app-box-editor pointer'
            style={style}
            onContextMenu={async (event) => {
                event.stopPropagation();
                showCanvasItemContextMenu(
                    event, canvasController, canvasItemText,
                );
            }}
            onClick={async (event) => {
                event.stopPropagation();
                canvasController.stopAllMods();
                canvasController.setItemIsSelecting(canvasItemText, true);
            }}>
            <BENTextRender props={canvasItemText.props} />
        </div>
    );
}

export function BENTextRender({ props }: Readonly<{
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
            }} />
    );
}
