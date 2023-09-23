import React from 'react';
import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const BibleList = React.lazy(() => {
    return import('./bible-list/BibleList');
});
const BiblePreviewer = React.lazy(() => {
    return import('./read-bible/BiblePreviewer');
});

export default function AppReading() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.read}
            flexSizeDefault={{
                'h1': ['1'],
                'h2': ['4'],
            }}
            resizeKinds={['h']}
            dataInput={[
                [BibleList, 'h1', 'flex v'],
                [BiblePreviewer, 'h2', 'flex v'],
            ]} />
    );
}
