import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const LazyBibleList = lazy(() => {
    return import('./bible-list/BibleList');
});
const LazyMiniScreen = lazy(() => {
    return import('./_screen/preview/MiniScreen');
});

export default function AppPresenterRight() {
    return (
        <ResizeActor flexSizeName={resizeSettingNames.appPresenterRight}
            isHorizontal={false}
            flexSizeDefault={{
                'v1': ['1'],
                'v2': ['1'],
            }}
            dataInput={[
                {
                    children: LazyBibleList, key: 'v1',
                    widgetName: 'Bible List',
                    className: 'flex-item',
                },
                {
                    children: LazyMiniScreen, key: 'v2',
                    widgetName: 'Mini Screen', className: 'flex-item',
                },
            ]} />
    );
}
