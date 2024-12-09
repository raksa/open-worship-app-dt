import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';
import { useSelectedSlideItemContext } from './slide-list/SlideItem';
import { useSelectedSlideContext } from './slide-list/Slide';

const LazySlideItemEditorGround = lazy(() => {
    return import('./slide-editor/SlideItemEditorGround');
});
const LazySlidePreviewer = lazy(() => {
    return import('./slide-presenter/items/SlidePreviewer');
});

export default function AppEditor() {
    const { selectedSlide } = useSelectedSlideContext();
    const { selectedSlideItem } = useSelectedSlideItemContext();
    if (selectedSlide === null || selectedSlideItem) {
        return (
            <div className='alert alert-warning'>
                "No Slide Selected" please select one!
            </div>
        );
    }
    return (
        <ResizeActor fSizeName={resizeSettingNames.appEditor}
            isHorizontal
            flexSizeDefault={{
                'h1': ['1'],
                'h2': ['3'],
            }}
            dataInput={[
                {
                    children: LazySlidePreviewer, key: 'h1',
                    widgetName: 'App Editor Left',
                },
                {
                    children: LazySlideItemEditorGround, key: 'h2',
                    widgetName: 'Slide Item Editor Ground',
                },
            ]}
        />
    );
}