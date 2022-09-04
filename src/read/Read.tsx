import React from 'react';
import { resizeSettingNames } from '../resize-actor/flexSizeHelpers';
import ResizeActor from '../resize-actor/ResizeActor';

const BibleList = React.lazy(() => import('../bible-list/BibleList'));
const BiblePreviewer = React.lazy(() => import('../read-bible/BiblePreviewer'));

export default function Read() {
    return (
        <ResizeActor fSizeName={resizeSettingNames.read}
        flexSizeDefault={{
            'h1': ['4'],
            'h2': ['1'],
        }}
        resizeKinds={['h', 'h']}
        dataInput={[
            [BiblePreviewer, 'h1', 'flex v'],
            [BibleList, 'h2', 'flex v'],
        ]} />
    );
}
