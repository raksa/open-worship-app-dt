import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const SlideItemEditorGround = lazy(() => {
    return import('./slide-editor/SlideItemEditorGround');
});
const SlidePreviewer = lazy(() => {
    return import('./slide-presenter/items/SlidePreviewer');
});

export default function AppEditor() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.appEditor}
            isHorizontal
            flexSizeDefault={{
                'h1': ['1'],
                'h2': ['3'],
            }}
            dataInput={[
                {
                    children: SlidePreviewer, key: 'h1',
                    widgetName: 'App Editor Left',
                },
                {
                    children: SlideItemEditorGround, key: 'h2',
                    widgetName: 'Slide Item Editor Ground',
                },
            ]} />
    );
}
