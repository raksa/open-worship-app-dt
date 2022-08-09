import { BENImageRender } from '../../slide-editor/canvas/box/BENViewImageMode';
import { BENTextRender } from '../../slide-editor/canvas/box/BENViewTextMode';
import { BENBibleRender } from '../../slide-editor/canvas/box/BENViewBibleMode';
import { CanvasItemPropsType } from '../../slide-editor/canvas/canvasHelpers';

export default function CanvasItemRenderer({ props }: {
    props: CanvasItemPropsType & { src?: string },
}) {
    switch (props.type) {
        case 'image':
            return (
                <BENImageRender props={props as any} />
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
