import { lazy } from 'react';

import {
    DataInputType,
    FlexSizeType,
    resizeSettingNames,
} from './resize-actor/flexSizeHelpers';
import ResizeActorComp from './resize-actor/ResizeActorComp';
import AppSuspenseComp from './others/AppSuspenseComp';
import LookupBibleItemController from './bible-reader/LookupBibleItemController';
import { BibleItemsViewControllerContext } from './bible-reader/BibleItemsViewController';

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
let viewController: LookupBibleItemController | null = null;
const dataInput: DataInputType[] = [
    {
        children: LazyBibleListComp,
        key: 'h1',
        widgetName: 'Bible List',
    },
    {
        children: {
            render: () => {
                if (viewController === null) {
                    viewController = new LookupBibleItemController();
                }
                return (
                    <AppSuspenseComp>
                        <BibleItemsViewControllerContext value={viewController}>
                            <LazyRenderBibleLookupComp />
                        </BibleItemsViewControllerContext>
                    </AppSuspenseComp>
                );
            },
        },
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
