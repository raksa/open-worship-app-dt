import React from 'react';
import MiniPresentScreen from './_present/preview/MiniPresentScreen';
import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';
import PresentManager from './_present/PresentManager';
import { useAppEffect } from './helper/debuggerHelpers';

const BibleList = React.lazy(() => {
    return import('./bible-list/BibleList');
});
const LyricList = React.lazy(() => {
    return import('./lyric-list/LyricList');
});

export default function AppPresentingRight() {
    useAppEffect(() => {
        PresentManager.getAllInstances().forEach((presentManager) => {
            presentManager.fireResizeEvent();
        });
    });
    return (
        <>
            <div className='flex-fill flex v h-100'>
                <ResizeActor fSizeName={resizeSettingNames.appPresentingRight}
                    flexSizeDefault={{
                        'v1': ['1'],
                        'v2': ['1'],
                    }}
                    resizeKinds={['v']}
                    dataInput={[
                        [BibleList, 'v1', 'flex-item'],
                        [LyricList, 'v2', 'flex-item'],
                    ]} />
            </div>
            <div>
                <MiniPresentScreen />
            </div>
        </>
    );
}
