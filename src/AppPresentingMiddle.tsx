import React from 'react';
import { settingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const Presenting = React.lazy(() => import('./slide-presenting/Presenting'));
const Background = React.lazy(() => import('./background/Background'));

export default function AppPresentingMiddle() {
    return (
        <ResizeActor fSizeName={settingNames.appPresentingMiddle}
            flexSizeDefault={{
                'v1': ['3'],
                'v2': ['1'],
            }}
            resizeKinds={['v']}
            dataInput={[
                [Presenting, 'v1', 'flex-item'],
                [Background, 'v2', 'flex-item'],
            ]} />
    );
}
