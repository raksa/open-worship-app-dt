import { CSSProperties } from 'react';

import { useCanvasItemContext } from '../CanvasItem';
import BoxEditorNormalViewImageModeComp from
    './BoxEditorNormalViewImageModeComp';
import BoxEditorNormalTextEditModeComp from './BoxEditorNormalTextEditModeComp';
import BoxEditorNormalViewTextModeComp from './BoxEditorNormalViewTextModeComp';
import BoxEditorNormalViewBibleModeComp from
    './BoxEditorNormalViewBibleModeComp';
import BoxEditorNormalViewErrorComp from './BoxEditorNormalViewErrorComp';
import BoxEditorNormalViewVideoModeComp from
    './BoxEditorNormalViewVideoModeComp';
import { useCanvasItemIsEditing } from '../canvasEventHelpers';

export default function BoxEditorNormalModeComp() {
    const canvasItem = useCanvasItemContext();
    const isEditing = useCanvasItemIsEditing();
    const style: CSSProperties = {
        ...canvasItem.getStyle(),
        ...canvasItem.getBoxStyle(),
    };
    switch (canvasItem.type) {
        case 'image':
            return (
                <BoxEditorNormalViewImageModeComp style={style} />
            );
        case 'video':
            return (
                <BoxEditorNormalViewVideoModeComp style={style} />
            );
        case 'text':
            if (isEditing) {
                return (
                    <BoxEditorNormalTextEditModeComp style={style} />
                );
            }
            return (
                <BoxEditorNormalViewTextModeComp style={style} />
            );
        case 'bible':
            return (
                <BoxEditorNormalViewBibleModeComp style={style} />
            );
        default:
            return (
                <BoxEditorNormalViewErrorComp />
            );
    }
}
