import React from 'react';
import { settingNames } from '../resize-actor/flexSizeHelpers';
import ResizeActor from '../resize-actor/ResizeActor';
import SlideItem from '../slide-list/SlideItem';
import CanvasController from './canvas/CanvasController';

const SlideItemEditorCanvas = React.lazy(() => {
    return import('./canvas/SlideItemEditorCanvas');
});
const Tools = React.lazy(() => {
    return import('./canvas/tools/Tools');
});

export default function SlideItemEditor({ slideItem }: {
    slideItem: SlideItem
}) {
    if (slideItem.isError) {
        return (
            <div className='alert alert-danger'>Error</div>
        );
    }
    return (
        <div className='slide-item-editor flex v w-100 h-100'
            onWheel={(event) => {
                if (event.ctrlKey) {
                    CanvasController.getInstance()
                        .applyScale(event.deltaY > 0);
                }
            }}>
            <ResizeActor fSizeName={settingNames.slideItemEditor}
                flexSizeDefault={{
                    'v1': ['3'],
                    'v2': ['1'],
                }}
                resizeKinds={['v']}
                dataInput={[
                    [SlideItemEditorCanvas, 'v1', 'flex-item'],
                    [Tools, 'v2', 'flex-item'],
                ]} />
        </div>
    );
}
