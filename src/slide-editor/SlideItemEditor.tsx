import { lazy } from 'react';

import { resizeSettingNames } from '../resize-actor/flexSizeHelpers';
import ResizeActor from '../resize-actor/ResizeActor';
import SlideItem from '../slide-list/SlideItem';
import CanvasController from './canvas/CanvasController';

const SlideItemEditorCanvas = lazy(() => {
    return import('./canvas/SlideItemEditorCanvas');
});
const Tools = lazy(() => {
    return import('./canvas/tools/Tools');
});

export default function SlideItemEditor({ slideItem }: Readonly<{
    slideItem: SlideItem
}>) {
    if (slideItem.isError) {
        return (
            <div className='alert alert-danger'>Error</div>
        );
    }
    return (
        <div className='slide-item-editor w-100 h-100 overflow-hidden'
            onWheel={(event) => {
                if (event.ctrlKey) {
                    CanvasController.getInstance()
                        .applyScale(event.deltaY > 0);
                }
            }}>
            <ResizeActor fSizeName={resizeSettingNames.slideItemEditor}
                isHorizontal={false}
                flexSizeDefault={{
                    'v1': ['3'],
                    'v2': ['1'],
                }}
                dataInput={[
                    {
                        children: SlideItemEditorCanvas, key: 'v1',
                        className: 'flex-item',
                    },
                    {
                        children: Tools, key: 'v2', className: 'flex-item',
                    },
                ]} />
        </div>
    );
}
