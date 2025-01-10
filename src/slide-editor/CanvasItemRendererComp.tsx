import { BoxEditorNormalImageRender } from './canvas/box/BoxEditorNormalViewImageModeComp';
import { BoxEditorNormalTextRender } from './canvas/box/BoxEditorNormalViewTextModeComp';
import { BoxEditorNormalBibleRender } from './canvas/box/BoxEditorNormalViewBibleModeComp';
import { useCanvasItemContext } from './canvas/CanvasItem';
import { BoxEditorNormalVideoRender } from './canvas/box/BoxEditorNormalViewVideoModeComp';

export default function CanvasItemRendererComp() {
    const canvasItem = useCanvasItemContext();
    switch (canvasItem.type) {
        case 'image':
            return <BoxEditorNormalImageRender />;
        case 'video':
            return <BoxEditorNormalVideoRender />;
        case 'text':
            return <BoxEditorNormalTextRender />;
        case 'bible':
            return <BoxEditorNormalBibleRender />;
    }
    return null;
}
