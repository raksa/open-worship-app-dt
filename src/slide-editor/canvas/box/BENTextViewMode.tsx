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
            <span dangerouslySetInnerHTML={{
                __html: canvasItemText.props.text.split('\n').join('<br>'),
            }} />
        </div>
    );
}
