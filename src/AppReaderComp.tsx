import { lazy } from 'react';

import {
    DataInputType,
    FlexSizeType,
    resizeSettingNames,
} from './resize-actor/flexSizeHelpers';
import ResizeActorComp from './resize-actor/ResizeActorComp';
import BibleItemViewController, {
    BibleItemViewControllerContext,
} from './bible-reader/BibleItemViewController';

const LazyBibleList = lazy(() => {
    return import('./bible-list/BibleListComp');
});
const LazyRenderBibleSearch = lazy(() => {
    return import('./bible-search/RenderBibleSearchComp');
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
        children: LazyRenderBibleSearch,
        key: 'h2',
        widgetName: 'Bible Previewer',
    },
];
const viewController = new BibleItemViewController('reader');
export default function AppReaderComp() {
    return (
        <BibleItemViewControllerContext value={viewController}>
            <ResizeActorComp
                flexSizeName={resizeSettingNames.read}
                isHorizontal
                flexSizeDefault={flexSizeDefault}
                dataInput={dataInput}
            />
        </BibleItemViewControllerContext>
    );
}
