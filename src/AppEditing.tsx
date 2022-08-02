import React from 'react';
import { settingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const SlideItemEditorGround = React.lazy(() => {
    return import('./slide-editor/SlideItemEditorGround');
});
const AppEditingLeft = React.lazy(() => {
    return import('./AppEditingLeft');
});

export default function AppEditing() {
    return (
        <ResizeActor fSizeName={settingNames.appEditing}
            flexSizeDefault={{
                'h1': ['1'],
                'h2': ['3'],
            }}
            resizeKinds={['h']}
            dataInput={[
                [AppEditingLeft, 'h1', 'flex v'],
                [SlideItemEditorGround, 'h2', 'flex v'],
            ]} />
    );
}
