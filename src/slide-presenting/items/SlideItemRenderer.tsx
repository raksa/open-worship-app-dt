import SlideItem from '../../slide-list/SlideItem';
import reactDomServer from 'react-dom/server';
import CanvasItemRenderer from './CanvasItemRenderer';
import CanvasItem from '../../slide-editor/canvas/CanvasItem';

export function genSlideItemHtmlString(slideItem: SlideItem) {
    return reactDomServer.renderToStaticMarkup(
        <SlideItemRenderer slideItem={slideItem} />);
}

export default function SlideItemRenderer({ slideItem }: {
    slideItem: SlideItem,
}) {
    return (
        <div style={{
            width: slideItem.width,
            height: slideItem.height,
        }}>
            {slideItem.canvasItemsJson.map((canvasItemJson: any, i) => {
                return (
                    <div key={i}
                        style={CanvasItem.genBoxStyle(canvasItemJson)}>
                        <CanvasItemRenderer
                            props={canvasItemJson} />
                    </div>
                );
            })}
        </div>
    );
}
