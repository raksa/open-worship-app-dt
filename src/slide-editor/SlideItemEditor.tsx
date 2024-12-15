import { lazy } from 'react';

import { resizeSettingNames } from '../resize-actor/flexSizeHelpers';
import ResizeActor from '../resize-actor/ResizeActor';
import CanvasController, {
    CanvasControllerContext,
} from './canvas/CanvasController';
import { handleCtrlWheel } from '../others/AppRange';
import { defaultRangeSize } from './canvas/tools/SlideItemEditorTools';
import { useCanvasControllerEvents } from './canvas/canvasEventHelpers';
import {
    useSelectedEditingSlideItemContext,
    useSelectedEditingSlideItemSetterContext,
} from '../slide-list/SlideItem';
import FileSource from '../helper/FileSource';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';

const LazySlideItemEditorCanvas = lazy(() => {
    return import('./canvas/SlideItemEditorCanvasComp');
});
const LazySlideItemEditorTools = lazy(() => {
    return import('./canvas/tools/SlideItemEditorTools');
});

export default function SlideItemEditor() {
    const setSelectedSlideItem = useSelectedEditingSlideItemSetterContext();
    const selectedSlideItem = useSelectedEditingSlideItemContext();
    const canvasController = new CanvasController(selectedSlideItem);
    useCanvasControllerEvents(canvasController, ['update'], () => {
        const fileSource = FileSource.getInstance(selectedSlideItem.filePath);
        fileSource.fireEditEvent(canvasController.slideItem);
    });
    useFileSourceEvents(
        ['update'], canvasController.slideItem.filePath,
        (newSlideItems: any) => {
            if (
                newSlideItems === undefined ||
                !(newSlideItems instanceof Array)
            ) {
                return;
            }
            const currentSlideItem = newSlideItems.find((item: any) => {
                return item.id === canvasController.slideItem.id;
            });
            if (currentSlideItem !== undefined && !currentSlideItem.isChanged) {
                currentSlideItem.a = 1;
                setSelectedSlideItem(currentSlideItem);
            }
        }
    );
    return (
        <CanvasControllerContext value={canvasController}>
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
                <ResizeActor flexSizeName={resizeSettingNames.slideItemEditor}
                    isHorizontal={false}
                    flexSizeDefault={{
                        'v1': ['3'],
                        'v2': ['1'],
                    }}
                    dataInput={[
                        {
                            children: LazySlideItemEditorCanvas, key: 'v1',
                            widgetName: 'Slide Item Editor Canvas',
                            className: 'flex-item',
                        },
                        {
                            children: LazySlideItemEditorTools, key: 'v2',
                            widgetName: 'Tools', className: 'flex-item',
                        },
                    ]} />
            </div>
        </CanvasControllerContext>
    );
}
