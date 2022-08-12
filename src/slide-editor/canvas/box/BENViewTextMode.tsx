import { CSSProperties } from 'react';
import CanvasController from '../CanvasController';
import {
    showCanvasItemContextMenu,
} from '../canvasCMHelpers';
import CanvasItemText, {
    CanvasItemTextPropsType,
} from '../CanvasItemText';
import { BENViewErrorRender } from './BENViewError';

export default function BENViewTextMode({
    canvasItemText, style,
}: {
    canvasItemText: CanvasItemText,
    style: CSSProperties
}) {
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

export function BENTextRender({ props }: {
    props: CanvasItemTextPropsType,
}) {
    try {
        CanvasItemText.validate(props);
    } catch (error) {
        return (
            <BENViewErrorRender />
        );
    }
    return (
        <div className='w-100 h-100'
            style={CanvasItemText.genStyle(props)}>
            {props.text}
        </div>
    );
}
