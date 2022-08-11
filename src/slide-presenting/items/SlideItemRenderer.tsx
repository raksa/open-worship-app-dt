import CanvasItemRenderer from './CanvasItemRenderer';
import CanvasItem, {
    CanvasItemPropsType,
} from '../../slide-editor/canvas/CanvasItem';

export default function SlideItemRenderer({
    width, height, canvasItemsJson,
}: {
    width: number, height: number,
    canvasItemsJson: CanvasItemPropsType[],
}) {
    return (
        <div style={{
            width,
            height,
        }}>
            {canvasItemsJson.map((canvasItemJson: any, i) => {
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
