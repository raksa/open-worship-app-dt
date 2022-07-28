import { CSSProperties } from 'react';
import { useContextCC } from '../CanvasController';
import {
    showCanvasItemContextMenu,
} from '../canvasHelpers';
import CanvasItemText, {
    CanvasItemTextPropsType,
} from '../CanvasItemText';

export default function BENViewTextMode({
    canvasItemText, style,
}: {
    canvasItemText: CanvasItemText,
    style: CSSProperties
}) {
    const canvasController = useContextCC();
    if (canvasController === null) {
        return null;
    }
    return (
        <div className='box-editor pointer'
            style={style}
            onContextMenu={async (e) => {
                e.stopPropagation();
                showCanvasItemContextMenu(e,
                    canvasController, canvasItemText);
            }}
            onClick={async (e) => {
                e.stopPropagation();
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
    return (
        <div className='w-100 h-100'
            style={CanvasItemText.genStyle(props)}>
            {props.text}
        </div>
    );
}
