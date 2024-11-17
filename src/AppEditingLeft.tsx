import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const SlideList = lazy(() => {
    return import('./slide-list/SlideList');
});
const SlidePreviewer = lazy(() => {
    return import('./slide-presenting/items/SlidePreviewer');
});

export default function AppEditingLeft() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.appEditingLeft}
            isHorizontal={false}
            flexSizeDefault={{
                'v1': ['1'],
                'v2': ['2'],
            }}
            dataInput={[
                {
                    children: SlideList, key: 'v1',
                    widgetName: 'Slide List', className: 'flex-item',
                },
                {
                    children: SlidePreviewer, key: 'v2',
                    widgetName: 'Slide Previewer', className: 'flex-item',
                },
            ]} />
    );
}
