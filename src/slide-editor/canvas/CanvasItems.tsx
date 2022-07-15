import CanvasController from './CanvasController';
import { useCCCanvasItems } from './canvasHelpers';

export default function CanvasItems({ canvasController }: {
    canvasController: CanvasController,
}) {
    const canvasItems = useCCCanvasItems(canvasController);
    return (
        <div className='alert'>
            {canvasItems.map((canvasItem, i) => {
                return (
                    <div className='btn btn-outline-info'
                        key={i} dangerouslySetInnerHTML={{
                            __html: canvasItem.html.innerHTML ?? '[]',
                        }} />
                );
            })}
        </div>
    );
}
