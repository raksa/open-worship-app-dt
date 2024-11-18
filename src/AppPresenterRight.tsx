import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const BibleList = lazy(() => {
    return import('./bible-list/BibleList');
});
const MiniScreen = lazy(() => {
    return import('./_screen/preview/MiniScreen');
});

export default function AppPresenterRight() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.appPresenterRight}
            isHorizontal={false}
            flexSizeDefault={{
                'v1': ['1'],
                'v2': ['1'],
            }}
            dataInput={[
                {
                    children: BibleList, key: 'v1', widgetName: 'Bible List',
                    className: 'flex-item',
                },
                {
                    children: MiniScreen, key: 'v2',
                    widgetName: 'Mini Screen', className: 'flex-item',
                },
            ]} />
    );
}
