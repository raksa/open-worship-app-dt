import { lazy } from 'react';

import {
    DataInputType,
    FlexSizeType,
    resizeSettingNames,
} from './resize-actor/flexSizeHelpers';
import ResizeActorComp from './resize-actor/ResizeActorComp';

const LazyBibleList = lazy(() => {
    return import('./bible-list/BibleListComp');
});
const LazyRenderBibleLookup = lazy(() => {
    return import('./bible-lookup/RenderBibleLookupComp');
});

const flexSizeDefault: FlexSizeType = {
    h1: ['1'],
    h2: ['4'],
};
const dataInput: DataInputType[] = [
    {
        children: LazyBibleList,
        key: 'h1',
        widgetName: 'Bible List',
    },
    {
        children: LazyRenderBibleLookup,
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
