import SlideEditorToolsTextComp from './SlideEditorToolsTextComp';
import SlideEditorToolsBoxComp from './SlideEditorToolsBoxComp';
import CanvasItem, { CanvasItemContext } from '../CanvasItem';
import SlideEditorToolTitleComp from './SlideEditorToolTitleComp';

export default function SlideEditorPropertiesComp({
    canvasItems,
}: Readonly<{
    canvasItems: CanvasItem<any>[];
}>) {
    return (
        <div
            className="d-flex flex-column w-100 h-100 p-1"
            style={{
                overflowX: 'hidden',
            }}
        >
            {canvasItems.length === 0 ? (
                <div className="d-flex flex-fill justify-content-center">
                    <span className="text-muted">No canvas item selected</span>
                </div>
            ) : null}
            {canvasItems.map((canvasItem) => {
                return (
                    <div key={canvasItem.id} className="card m-1">
                        <div className="card-header">
                            <strong>Item ID: {canvasItem.id}</strong>
                        </div>
                        <div
                            className="card-body w-100 d-flex flex-wrap"
                            style={{
                                overflow: 'auto',
                            }}
                        >
                            <CanvasItemContext value={canvasItem}>
                                <div className="m-1 app-border-white-round">
                                    <SlideEditorToolTitleComp title="Box Properties">
                                        <SlideEditorToolsBoxComp />
                                    </SlideEditorToolTitleComp>
                                </div>
                                {canvasItem.type === 'text' ? (
                                    <div className="m-1 app-border-white-round">
                                        <SlideEditorToolTitleComp title="Text Properties">
                                            <SlideEditorToolsTextComp />
                                        </SlideEditorToolTitleComp>
                                    </div>
                                ) : null}
                                <div />
                            </CanvasItemContext>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
