import React from 'react';
import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const AppPresentingLeft = React.lazy(() => {
    return import('./AppPresentingLeft');
});
const AppPresentingMiddle = React.lazy(() => {
    return import('./AppPresentingMiddle');
});
const AppPresentingRight = React.lazy(() => {
    return import('./AppPresentingRight');
});

export default function AppPresenting() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.appPresenting}
            flexSizeDefault={{
                'h1': ['1'],
                'h2': ['3'],
                'h3': ['2'],
            }}
            resizeKinds={['h', 'h']}
            dataInput={[
                [AppPresentingLeft, 'h1', 'flex v'],
                [AppPresentingMiddle, 'h2', 'flex v'],
                [AppPresentingRight, 'h3', 'flex v'],
            ]} />
    );
}
