import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const LazySlideList = lazy(() => {
    return import('./slide-list/SlideList');
});
const LazySlidePreviewer = lazy(() => {
    return import('./slide-presenter/items/SlidePreviewer');
});

export default function AppEditorLeft() {
    return (
        <ResizeActor flexSizeName={resizeSettingNames.appEditorLeft}
            isHorizontal={false}
            flexSizeDefault={{
                'v1': ['1'],
                'v2': ['2'],
            }}
            dataInput={[
                {
                    children: LazySlideList, key: 'v1',
                    widgetName: 'Slide List', className: 'flex-item',
                },
                {
                    children: LazySlidePreviewer, key: 'v2',
                    widgetName: 'Slide Previewer', className: 'flex-item',
                },
            ]}
        />
    );
}
