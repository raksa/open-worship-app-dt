import React from 'react';
import MiniPresentScreen from './preview/MiniPresentScreen';
import { settingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const BibleList = React.lazy(() => import('./bible-list/BibleList'));
const LyricList = React.lazy(() => import('./lyric-list/LyricList'));

export default function AppPresentingRight() {
    return (
        <>
            <div className='flex-fill flex v h-100'>
                <ResizeActor fSizeName={settingNames.appPresentingRight}
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
