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
                [AppEditingLeft, 'h1', ''],
                [SlideItemEditorGround, 'h2', ''],
            ]} />
    );
}
