import ReactDOMServer from 'react-dom/server';
import CanvasItemRendererComp from '../../slide-editor/CanvasItemRendererComp';
import CanvasItem, {
    CanvasItemContext,
    CanvasItemPropsType,
} from '../../slide-editor/canvas/CanvasItem';
import { getDivHTMLChild } from '../../helper/helpers';
import Canvas from '../../slide-editor/canvas/Canvas';

export function genHtmlSlideItem(canvasItemsJson: CanvasItemPropsType[]) {
    const htmlString = ReactDOMServer.renderToStaticMarkup(
        <SlideItemRenderer width={'100%'} height={'100%'}
            canvasItemsJson={canvasItemsJson}
        />
    );
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return getDivHTMLChild(div);
}

export default function SlideItemRenderer({
    width, height, canvasItemsJson,
}: Readonly<{
    width: string, height: string,
    canvasItemsJson: CanvasItemPropsType[],
}>) {
    return (
        <div style={{
            width: `${width}px`,
            height: `${height}px`,
        }}>
            {canvasItemsJson.map((canvasItemJson: any) => {
                const canvasItem = Canvas.canvasItemFromJson(canvasItemJson);
                return (
                    <div key={canvasItemJson.id}
                        style={CanvasItem.genBoxStyle(canvasItemJson)}>
                        <CanvasItemContext value={canvasItem}>
                            <CanvasItemRendererComp />
                        </CanvasItemContext>
                    </div>
                );
            })}
        </div>
    );
}
