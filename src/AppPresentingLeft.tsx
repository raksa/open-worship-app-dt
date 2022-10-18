import React from 'react';
import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const SlideList = React.lazy(() => import('./slide-list/SlideList'));
const PlaylistList = React.lazy(() => import('./playlist/PlaylistList'));

export default function AppPresentingLeft() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.appEditingLeft}
            flexSizeDefault={{
                'v1': ['2'],
                'v2': ['1'],
            }}
            resizeKinds={['v']}
            dataInput={[
                [SlideList, 'v1', 'flex-item'],
                [PlaylistList, 'v2', 'flex-item'],
            ]} />
    );
}
