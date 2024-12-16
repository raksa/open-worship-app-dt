import { useOptimistic } from 'react';
import CanvasItemRendererComp
    from '../../../slide-presenter/items/CanvasItemRendererComp';
import { showCanvasItemContextMenu } from '../canvasCMHelpers';
import { useCanvasControllerContext } from '../CanvasController';
import { CanvasItemContext } from '../CanvasItem';

export default function ToolCanvasItemsComp() {
    const canvasController = useCanvasControllerContext();
    const [canvasItems] = useOptimistic(canvasController.canvas.canvasItems);
    return (
        <div className='w-100 h-100 d-flex justify-content-center'>
            {canvasItems.map((canvasItem) => {
                const { props } = canvasItem;
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
                            {props.width}x{props.height}
                        </div>
                        <div className='card-body'>
                            <CanvasItemContext value={canvasItem}>
                                <CanvasItemRendererComp />
                            </CanvasItemContext>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
