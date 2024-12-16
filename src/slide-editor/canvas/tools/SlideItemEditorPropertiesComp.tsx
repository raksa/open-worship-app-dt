import './SlideItemEditorPropertiesComp.scss';

import SlideItemEditorToolsTextComp from './SlideItemEditorToolsTextComp';
import SlideItemEditorToolsBoxComp from './SlideItemEditorToolsBoxComp';
import CanvasItem, { CanvasItemContext } from '../CanvasItem';
import SlideItemEditorToolTitleComp from './SlideItemEditorToolTitleComp';

export default function SlideItemEditorPropertiesComp({
    canvasItems,
}: Readonly<{
    canvasItems: CanvasItem<any>[],
}>) {
    return (
        <div className='app-tool-properties w-100 h-100'>
            {canvasItems.length === 0 ? (
                <div className='d-flex flex-fill justify-content-center'>
                    <span className='text-muted'>
                        No canvas item selected
                    </span>
                </div>
            ) : null}
            {canvasItems.map((canvasItem) => {
                return (
                    <div key={canvasItem.id}
                        className='d-flex w-100' >
                        <CanvasItemContext value={canvasItem}>
                            <div className='m-1 border-white-round'>
                                <SlideItemEditorToolTitleComp
                                    title='Box Properties'>
                                    <SlideItemEditorToolsBoxComp />
                                </SlideItemEditorToolTitleComp>
                            </div>
                            {canvasItem.type === 'text' ? (
                                <div className='m-1 border-white-round'>
                                    <SlideItemEditorToolTitleComp
                                        title='Text Properties'>
                                        <SlideItemEditorToolsTextComp />
                                    </SlideItemEditorToolTitleComp>
                                </div>
                            ) : null}
                            <div />
                        </CanvasItemContext>
                        <hr />
                    </div>
                );
            })}
        </div>
    );
}
