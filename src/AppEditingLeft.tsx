import React from 'react';
import { settingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const SlideList = React.lazy(() => import('./slide-list/SlideList'));
const SlidePreviewer = React.lazy(() => import('./slide-presenting/items/SlidePreviewer'));

export default function AppEditingLeft() {
    return (
        <ResizeActor fSizeName={settingNames.appEditingLeft}
            flexSizeDefault={{
                'v1': ['1'],
                'v2': ['2'],
            }}
            resizeKinds={['v']}
            dataInput={[
                [SlideList, 'v1', 'flex-item'],
                [SlidePreviewer, 'v2', 'flex-item'],
            ]} />
    );
}
