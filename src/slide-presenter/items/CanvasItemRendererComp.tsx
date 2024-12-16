import {
    BoxEditorNormalImageRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewImageModeComp';
import {
    BoxEditorNormalTextRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewTextModeComp';
import {
    BoxEditorNormalBibleRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewBibleModeComp';
import {
    useCanvasItemContext,
} from '../../slide-editor/canvas/CanvasItem';
import {
    BoxEditorNormalVideoRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewVideoModeComp';

export default function CanvasItemRendererComp() {
    const canvasItem = useCanvasItemContext();
    switch (canvasItem.type) {
        case 'image':
            return (
                <BoxEditorNormalImageRender />
            );
        case 'video':
            return (
                <BoxEditorNormalVideoRender />
            );
        case 'text':
            return (
                <BoxEditorNormalTextRender />
            );
        case 'bible':
            return (
                <BoxEditorNormalBibleRender />
            );

    }
    return null;
}
