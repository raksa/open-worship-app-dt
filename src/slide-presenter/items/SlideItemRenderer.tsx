import ReactDOMServer from 'react-dom/server';
import CanvasItemRenderer from './CanvasItemRenderer';
import CanvasItem, {
    CanvasItemPropsType,
} from '../../slide-editor/canvas/CanvasItem';
import { getDivHTMLChild } from '../../helper/helpers';

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
                return (
                    <div key={canvasItemJson.id}
                        style={CanvasItem.genBoxStyle(canvasItemJson)}>
                        <CanvasItemRenderer
                            props={canvasItemJson}
                        />
                    </div>
                );
            })}
        </div>
    );
}
