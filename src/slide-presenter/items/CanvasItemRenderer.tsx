import {
    BoxEditorNormalImageRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewImageMode';
import {
    BENTextRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewTextMode';
import {
    BENBibleRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewBibleMode';
import {
    CanvasItemPropsType,
} from '../../slide-editor/canvas/CanvasItem';
import {
    BENVideoRender,
} from '../../slide-editor/canvas/box/BoxEditorNormalViewVideoMode';

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
                <BENVideoRender props={props as any} />
            );
        case 'text':
            return (
                <BENTextRender props={props as any} />
            );
        case 'bible':
            return (
                <BENBibleRender props={props as any} />
            );

    }
    return null;
}
