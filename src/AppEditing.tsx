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
