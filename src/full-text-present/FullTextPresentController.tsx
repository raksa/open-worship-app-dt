import './FullTextPresentController.scss';

import React from 'react';
import ResizeActor from '../resize-actor/ResizeActor';
import { resizeSettingNames } from '../resize-actor/flexSizeHelpers';

const FullTextPreviewer = React.lazy(() => {
    return import('./FullTextPreviewer');
});
const FullTextTools = React.lazy(() => {
    return import('./FullTextTools');
});

export default function FullTextPresentController() {
    return (
        <div id='full-text-present-controller'
            className='card w-100 h-100 border-white-round'>
            <div className='card-body flex v'>
                <ResizeActor fSizeName={resizeSettingNames.fullText}
                    flexSizeDefault={{
                        'v1': ['2'],
                        'v2': ['1'],
                    }}
                    resizeKinds={['v']}
                    dataInput={[
                        [FullTextPreviewer, 'v1', 'overflow-hidden'],
                        [FullTextTools, 'v2', 'h-100 d-flex flex-column', {
                            overflowX: 'hidden',
                            overflowY: 'auto',
                        }],
                    ]} />
            </div>
        </div>
    );
}
