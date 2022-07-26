import { CSSProperties } from 'react';
import {
    showCanvasItemContextMenu,
} from '../canvasHelpers';
import CanvasItemText from '../CanvasItemText';

export default function BENTextViewMode({
    canvasItemText, style,
}: {
    canvasItemText: CanvasItemText,
    style: CSSProperties
}) {
    return (
        <div className='box-editor pointer'
            style={style}
            onContextMenu={async (e) => {
                e.stopPropagation();
                showCanvasItemContextMenu(e, canvasItemText);
            }}
            onClick={async (e) => {
                e.stopPropagation();
                canvasItemText.canvasController?.stopAllMods();
                canvasItemText.isSelected = true;
            }}>
            <BENTextRender canvasItemText={canvasItemText} />
        </div>
    );
}

export function BENTextRender({ canvasItemText }: {
    canvasItemText: CanvasItemText,
}) {
    return (
        <div className='w-100 h-100'
            style={canvasItemText.getStyle()}
            dangerouslySetInnerHTML={{
                __html: canvasItemText.html.innerHTML,
            }} />
    );
}
