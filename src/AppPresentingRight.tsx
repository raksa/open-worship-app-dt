import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const BibleList = lazy(() => {
    return import('./bible-list/BibleList');
});
const MiniPresentScreen = lazy(() => {
    return import('./_present/preview/MiniPresentScreen');
});

export default function AppPresentingRight() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.appPresentingRight}
            isHorizontal={false}
            flexSizeDefault={{
                'v1': ['1'],
                'v2': ['1'],
            }}
            dataInput={[
                [BibleList, 'v1', 'flex-item'],
                [MiniPresentScreen, 'v2', 'flex-item'],
            ]} />
    );
}
