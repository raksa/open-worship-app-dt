import { CSSProperties } from 'react';

import CanvasController from '../CanvasController';
import {
    showCanvasItemContextMenu,
} from '../canvasCMHelpers';
import CanvasItemText, {
    CanvasItemTextPropsType,
} from '../CanvasItemText';
import { BENViewErrorRender } from './BENViewError';
import { handleError } from '../../../helper/errorHelpers';

export default function BENViewTextMode({ canvasItemText, style }: Readonly<{
    canvasItemText: CanvasItemText,
    style: CSSProperties
}>) {
    return (
        <div className='box-editor pointer'
            style={style}
            onContextMenu={async (event) => {
                event.stopPropagation();
                showCanvasItemContextMenu(event, canvasItemText);
            }}
            onClick={async (event) => {
                event.stopPropagation();
                const canvasController = CanvasController.getInstance();
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
