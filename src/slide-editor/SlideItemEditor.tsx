import { lazy } from 'react';

import { resizeSettingNames } from '../resize-actor/flexSizeHelpers';
import ResizeActor from '../resize-actor/ResizeActor';
import CanvasController from './canvas/CanvasController';
import { handleCtrlWheel } from '../others/AppRange';
import { defaultRangeSize } from './canvas/tools/Tools';

const SlideItemEditorCanvas = lazy(() => {
    return import('./canvas/SlideItemEditorCanvas');
});
const Tools = lazy(() => {
    return import('./canvas/tools/Tools');
});

export default function SlideItemEditor() {
    const canvasController = CanvasController.getInstance();
    return (
        <div className='slide-item-editor w-100 h-100 overflow-hidden'
            onWheel={(event) => {
                handleCtrlWheel({
                    event, value: canvasController.scale,
                    setValue: (scale) => {
                        canvasController.scale = scale;
                    },
                    defaultSize: defaultRangeSize,
                });
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
                        widgetName: 'Slide Item Editor Canvas',
                        className: 'flex-item',
                    },
                    {
                        children: Tools, key: 'v2',
                        widgetName: 'Tools', className: 'flex-item',
                    },
                ]} />
        </div>
    );
}
