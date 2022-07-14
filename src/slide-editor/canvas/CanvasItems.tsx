import CanvasController from './CanvasController';

export default function CanvasItems({ canvasController }: {
    canvasController: CanvasController,
}) {
    return (
        <div className='alert'>
            {canvasController.canvasItems.map((canvasItem, i) => {
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
