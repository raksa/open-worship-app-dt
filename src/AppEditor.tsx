import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const LazySlidePreviewer = lazy(() => {
    return import('./slide-presenter/items/SlidePreviewer');
});
const LazySlideItemEditorGround = lazy(() => {
    return import('./slide-editor/SlideItemEditorGround');
});

export default function AppEditor() {
    return (
        <ResizeActor flexSizeName={resizeSettingNames.appEditor}
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
