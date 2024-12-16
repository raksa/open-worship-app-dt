import './SlideItemEditorPropertiesComp.scss';

import SlideItemEditorToolsText from './SlideItemEditorToolsText';
import SlideItemEditorToolsBox from './SlideItemEditorToolsBox';
import { useCanvasItemsContext } from '../CanvasItem';
import SlideItemEditorToolTitleComp from './SlideItemEditorToolTitleComp';

export default function SlideItemEditorPropertiesComp() {
    const canvasItems = useCanvasItemsContext();
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
                        <div className='m-1 border-white-round'>
                            <SlideItemEditorToolTitleComp
                                title='Box Properties'>
                                <SlideItemEditorToolsBox
                                    canvasItem={canvasItem}
                                />
                            </SlideItemEditorToolTitleComp>
                        </div>
                        {canvasItem.type === 'text' ? (
                            <div className='m-1 border-white-round'>
                                <SlideItemEditorToolTitleComp
                                    title='Text Properties'>
                                    <SlideItemEditorToolsText
                                        canvasItem={canvasItem as any}
                                    />
                                </SlideItemEditorToolTitleComp>
                            </div>
                        ) : null}
                        <div />
                        <hr />
                    </div>
                );
            })}
        </div>
    );
}
