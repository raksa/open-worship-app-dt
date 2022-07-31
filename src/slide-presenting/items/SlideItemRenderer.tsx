import SlideItem from '../../slide-list/SlideItem';
import reactDomServer from 'react-dom/server';
import { CanvasItemPropsType } from '../../slide-editor/canvas/CanvasItem';
import { BENImageRender } from '../../slide-editor/canvas/box/BENViewImageMode';
import { BENTextRender } from '../../slide-editor/canvas/box/BENViewTextMode';
import { BENBibleRender } from '../../slide-editor/canvas/box/BENViewBibleMode';

export function genSlideItemHtmlString(slideItem: SlideItem) {
    return reactDomServer.renderToStaticMarkup(
        <SlideItemRenderer slideItem={slideItem} />);
}
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

export function SlideItemRenderer({ slideItem }: {
    slideItem: SlideItem,
}) {
    return (
        <div style={{
            width: slideItem.width,
            height: slideItem.height,
        }}>
            {slideItem.canvasItemsJson.map((canvasItemJson: any, i) => {
                return (
                    <CanvasItemRenderer key={i}
                        props={canvasItemJson} />
                );
            })}
        </div>
    );
}
