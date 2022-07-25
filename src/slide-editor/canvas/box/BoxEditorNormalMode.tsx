import { CSSProperties } from 'react';
import {
    useCIRefresh,
} from '../canvasHelpers';
import CanvasItem from '../CanvasItem';
import CanvasItemImage from '../CanvasItemImage';
import CanvasItemText from '../CanvasItemText';
import BENImageMode from './BENImageMode';
import BENTextEditMode from './BENTextEditMode';
import BENTextViewMode from './BENTextViewMode';

export default function BoxEditorNormalMode({ canvasItem }: {
    canvasItem: CanvasItem,
}) {
    const style: CSSProperties = {
        ...canvasItem.getStyle(),
        ...canvasItem.getBoxStyle(),
    };
    useCIRefresh(canvasItem, ['edit', 'update']);
    if (canvasItem.isTypeImage) {
        return (
            <BENImageMode canvasItemImage={canvasItem as CanvasItemImage}
                style={style} />
        );
    }
    if (canvasItem.isTypeText && canvasItem.isEditing) {
        const canvasItemText = canvasItem as CanvasItemText;
        if (canvasItem.isTypeText) {
            return (
                <BENTextEditMode canvasItemText={canvasItemText}
                    style={style} />
            );
        }
        return (
            <BENTextViewMode canvasItemText={canvasItemText}
                style={style} />
        );
    }
    return null;
}
