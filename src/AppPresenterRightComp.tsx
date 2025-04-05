import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActorComp from './resize-actor/ResizeActorComp';

const LazyBibleList = lazy(() => {
    return import('./bible-list/BibleListComp');
});
const LazyMiniScreen = lazy(() => {
    return import('./_screen/preview/MiniScreen');
});

export default function AppPresenterRightComp() {
    return (
        <ResizeActorComp
            flexSizeName={resizeSettingNames.appPresenterRight}
            isHorizontal={false}
            flexSizeDefault={{
                v1: ['4'],
                v2: ['5'],
            }}
            dataInput={[
                {
                    children: LazyBibleList,
                    key: 'v1',
                    widgetName: 'Bible List',
                    className: 'flex-item',
                },
                {
                    children: LazyMiniScreen,
                    key: 'v2',
                    widgetName: 'Mini Screen',
                    className: 'flex-item',
                },
            ]}
        />
    );
}
