import React from 'react';
import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const BibleList = React.lazy(() => {
    return import('./bible-list/BibleList');
});
const MiniPresentScreen = React.lazy(() => {
    return import('./_present/preview/MiniPresentScreen');
});

export default function AppPresentingRight() {
    return (
        <div className='flex v h-100'>
            <ResizeActor fSizeName={resizeSettingNames.appPresentingRight}
                flexSizeDefault={{
                    'v1': ['1'],
                    'v2': ['1'],
                }}
                resizeKinds={['v']}
                dataInput={[
                    [BibleList, 'v1', 'flex-item'],
                    [MiniPresentScreen, 'v2', 'flex-item'],
                ]} />
        </div>
    );
}
