import CanvasItemRenderer
    from '../../../slide-presenter/items/CanvasItemRenderer';
import { showCanvasItemContextMenu } from '../canvasCMHelpers';
import { useCanvasControllerContext } from '../CanvasController';
import { useCanvasControllerEvents } from '../canvasEventHelpers';

export default function ToolCanvasItems() {
    const canvasController = useCanvasControllerContext();
    const canvasItems = canvasController.canvas.canvasItems;
    useCanvasControllerEvents(canvasController, ['update']);
    return (
        <div className='w-100 h-100 d-flex justify-content-center'>
            {canvasItems.map((canvasItem) => {
                return (
                    <div key={canvasItem.id}
                        className='card pointer align-self-start m-2'
                        style={{
                            maxWidth: '200px',
                            border: canvasItem.isSelected ?
                                '2px dashed green' : undefined,
                        }}
                        onClick={() => {
                            canvasController.stopAllMods();
                            canvasController.setItemIsSelecting(
                                canvasItem, true);
                        }}
                        onContextMenu={(event) => {
                            showCanvasItemContextMenu(
                                event, canvasController, canvasItem,
                            );
                        }}>
                        <div className='card-header'>
                            {canvasItem.id}:
                            {canvasItem.props.width}x{canvasItem.props.height}
                        </div>
                        <div className='card-body'>
                            <CanvasItemRenderer
                                props={canvasItem.props}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
