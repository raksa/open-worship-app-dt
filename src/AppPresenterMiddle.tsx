import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const LazyPresenter = lazy(() => {
    return import('./app-document-presenter/Presenter');
});
const LazyBackground = lazy(() => {
    return import('./background/Background');
});

export default function AppPresenterMiddle() {
    return (
        <ResizeActor
            flexSizeName={resizeSettingNames.appPresenterMiddle}
            isHorizontal={false}
            flexSizeDefault={{
                v1: ['3'],
                v2: ['1'],
            }}
            dataInput={[
                {
                    children: LazyPresenter,
                    key: 'v1',
                    widgetName: 'Presenter',
                    className: 'flex-item',
                },
                {
                    children: LazyBackground,
                    key: 'v2',
                    widgetName: 'Background',
                    className: 'flex-item',
                },
            ]}
        />
    );
}
