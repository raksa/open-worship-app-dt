import { CanvasItemPropsType } from '../../slide-editor/canvas/CanvasItem';
import { BENImageRender } from '../../slide-editor/canvas/box/BENViewImageMode';
import { BENTextRender } from '../../slide-editor/canvas/box/BENViewTextMode';
import { BENBibleRender } from '../../slide-editor/canvas/box/BENViewBibleMode';

export default function CanvasItemRenderer({ props }: {
    props: CanvasItemPropsType & { src?: string },
}) {
    if (props.type === 'image') {
        return (
            <BENImageRender props={props as any} />
        );
    }
    if (props.type === 'text') {
        return (
            <BENTextRender props={props as any} />
        );
    }
    if (props.type === 'bible') {
        return (
            <BENBibleRender props={props as any} />
        );
    }
    return null;
}
