import React from 'react';
import { settingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const AppPresentingLeft = React.lazy(() => import('./AppPresentingLeft'));
const AppPresentingMiddle = React.lazy(() => import('./AppPresentingMiddle'));
const AppPresentingRight = React.lazy(() => import('./AppPresentingRight'));

export default function AppPresenting() {
    return (
        <ResizeActor fSizeName={settingNames.appPresenting}
            flexSizeDefault={{
                'h1': ['1'],
                'h2': ['3'],
                'h3': ['2'],
            }}
            resizeKinds={['h', 'h']}
            dataInput={[
                [AppPresentingLeft, 'h1', 'flex v'],
                [AppPresentingMiddle, 'h2', 'flex v'],
                [AppPresentingRight, 'h3', 'right d-flex flex-column'],
            ]} />
    );
}
