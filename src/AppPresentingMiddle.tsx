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
            isHorizontal={false}
            flexSizeDefault={{
                'v1': ['3'],
                'v2': ['1'],
            }}
            dataInput={[
                {
                    children: Presenting, key: 'v1', widgetName: 'Presenting',
                    className: 'flex-item',
                },
                {
                    children: Background, key: 'v2', widgetName: 'Background',
                    className: 'flex-item',
                },
            ]} />
    );
}
