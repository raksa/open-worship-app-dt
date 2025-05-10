import { lazy } from 'react';

import {
    DataInputType,
    FlexSizeType,
    resizeSettingNames,
} from './resize-actor/flexSizeHelpers';
import ResizeActorComp from './resize-actor/ResizeActorComp';

const LazyBibleListComp = lazy(() => {
    return import('./bible-list/BibleListComp');
});
const LazyRenderBibleLookupComp = lazy(() => {
    return import('./bible-lookup/RenderBibleLookupComp');
});

const flexSizeDefault: FlexSizeType = {
    h1: ['1'],
    h2: ['4'],
};
const dataInput: DataInputType[] = [
    {
        children: LazyBibleListComp,
        key: 'h1',
        widgetName: 'Bible List',
    },
    {
        children: LazyRenderBibleLookupComp,
        key: 'h2',
        widgetName: 'Bible Previewer',
    },
];
export default function AppReaderComp() {
    return (
        <ResizeActorComp
            flexSizeName={resizeSettingNames.read}
            isHorizontal
            flexSizeDefault={flexSizeDefault}
            dataInput={dataInput}
        />
    );
}
