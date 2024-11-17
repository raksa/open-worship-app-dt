import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const SlideItemEditorGround = lazy(() => {
    return import('./slide-editor/SlideItemEditorGround');
});
const AppEditingLeft = lazy(() => {
    return import('./AppEditingLeft');
});

export default function AppEditing() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.appEditing}
            isHorizontal
            flexSizeDefault={{
                'h1': ['1'],
                'h2': ['3'],
            }}
            dataInput={[
                {
                    children: AppEditingLeft, key: 'h1',
                    widgetName: 'App Editing Left',
                },
                {
                    children: SlideItemEditorGround, key: 'h2',
                    widgetName: 'Slide Item Editing Ground',
                },
            ]} />
    );
}
