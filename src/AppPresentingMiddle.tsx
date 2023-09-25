import { lazy } from 'react';
import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const Presenting = lazy(() => {
    return import('./slide-presenting/Presenting');
});
const Background = lazy(() => {
    return import('./background/Background');
});

export default function AppPresentingMiddle() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.appPresentingMiddle}
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
