import {
    BoxEditorNormalImageRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewImageModeComp';
import {
    BoxEditorNormalTextRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewTextModeComp';
import {
    BENBibleRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewBibleModeComp';
import {
    CanvasItemPropsType,
} from '../../slide-editor/canvas/CanvasItem';
import {
    BoxEditorNormalVideoRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewVideoModeComp';

export default function CanvasItemRenderer({ props }: Readonly<{
    props: CanvasItemPropsType,
}>) {
    switch (props.type) {
        case 'image':
            return (
                <BoxEditorNormalImageRender props={props as any} />
            );
        case 'video':
            return (
                <BoxEditorNormalVideoRender props={props as any} />
            );
        case 'text':
            return (
                <BoxEditorNormalTextRender props={props as any} />
            );
        case 'bible':
            return (
                <BENBibleRender props={props as any} />
            );

    }
    return null;
}
