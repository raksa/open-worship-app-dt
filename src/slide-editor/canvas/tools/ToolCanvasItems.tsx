import CanvasController from '../CanvasController';
import { showCanvasItemContextMenu, useCCRefresh } from '../canvasHelpers';

export default function ToolCanvasItems({ canvasController }: {
    canvasController: CanvasController,
}) {
    const canvasItems = canvasController.canvas.canvasItems;
    useCCRefresh(canvasController, ['update']);
    return (
        <div className='w-100 h-100 d-flex justify-content-center'>
            {canvasItems.map((canvasItem, i) => {
                return (
                    <div className='card' key={i} onContextMenu={(e) => {
                        showCanvasItemContextMenu(e, canvasItem);
                    }}>
                        <div className='card-header'>
                            {canvasItem.id}:
                            {canvasItem.props.width}x{canvasItem.props.height}
                        </div>
                        <div className='card-body'
                            dangerouslySetInnerHTML={{
                                __html: canvasItem.html.innerHTML ?? '[]',
                            }} />
                    </div>
                );
            })}
        </div>
    );
}
