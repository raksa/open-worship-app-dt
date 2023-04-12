import React from 'react';
import { resizeSettingNames } from '../resize-actor/flexSizeHelpers';
import ResizeActor from '../resize-actor/ResizeActor';

const BibleList = React.lazy(() => {
    return import('../bible-list/BibleList');
});
const ReadingBiblePreviewer = React.lazy(() => {
    return import('../read-bible/ReadingBiblePreviewer');
});

export default function Read() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.read}
            flexSizeDefault={{
                'h1': ['1'],
                'h2': ['4'],
            }}
            resizeKinds={['h', 'h']}
            dataInput={[
                [BibleList, 'h1', 'flex v'],
                [ReadingBiblePreviewer, 'h2', 'flex v'],
            ]} />
    );
}
