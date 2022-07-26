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
                    <div className='card pointer align-self-start m-2' key={i}
                        style={{
                            maxWidth: '200px',
                            border: canvasItem.isSelected ? '2px dashed green' : undefined,
                        }}
                        onClick={() => {
                            canvasController.stopAllMods();
                            canvasItem.isSelected = true;
                        }}
                        onContextMenu={(e) => {
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
