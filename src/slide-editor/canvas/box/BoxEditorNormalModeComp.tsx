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

export default function BoxEditorNormalModeComp() {
    const canvasItem = useCanvasItemContext();
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
            if (canvasItem.isEditing) {
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
