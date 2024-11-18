import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const Presenter = lazy(() => {
    return import('./slide-presenter/Presenter');
});
const Background = lazy(() => {
    return import('./background/Background');
});

export default function AppPresenterMiddle() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.appPresenterMiddle}
            isHorizontal={false}
            flexSizeDefault={{
                'v1': ['3'],
                'v2': ['1'],
            }}
            dataInput={[
                {
                    children: Presenter, key: 'v1', widgetName: 'Presenter',
                    className: 'flex-item',
                },
                {
                    children: Background, key: 'v2', widgetName: 'Background',
                    className: 'flex-item',
                },
            ]} />
    );
}
