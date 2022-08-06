import CanvasItemRenderer from '../../../slide-presenting/items/CanvasItemRenderer';
import CanvasController from '../CanvasController';
import {
    showCanvasItemContextMenu, useCCEvents,
} from '../canvasHelpers';

export default function ToolCanvasItems() {
    const canvasController = CanvasController.getInstance();
    const canvasItems = canvasController.canvas.canvasItems;
    useCCEvents(['update']);
    return (
        <div className='w-100 h-100 d-flex justify-content-center'>
            {canvasItems.map((canvasItem, i) => {
                return (
                    <div className='card pointer align-self-start m-2' key={i}
                        style={{
                            maxWidth: '200px',
                            border: canvasItem.isSelected ? '2px dashed green' : undefined,
                        }}
                        onClick={() => {
                            canvasController.stopAllMods();
                            canvasController.setItemIsSelecting(canvasItem, true);
                        }}
                        onContextMenu={(e) => {
                            showCanvasItemContextMenu(e, canvasItem);
                        }}>
                        <div className='card-header'>
                            {canvasItem.id}:
                            {canvasItem.props.width}x{canvasItem.props.height}
                        </div>
                        <div className='card-body'>
                            <CanvasItemRenderer
                                props={canvasItem.props} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
