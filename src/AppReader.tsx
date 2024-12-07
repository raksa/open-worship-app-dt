import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';
import BibleItemViewController, {
    BibleItemViewControllerContext,
} from './bible-reader/BibleItemViewController';

const LazyBibleList = lazy(() => {
    return import('./bible-list/BibleList');
});
const LazyRenderBibleSearch = lazy(() => {
    return import('./bible-search/RenderBibleSearch');
});

const viewController = new BibleItemViewController('reader');
export default function AppReader() {
    return (
        <BibleItemViewControllerContext.Provider
            value={viewController}>
            <ResizeActor fSizeName={resizeSettingNames.read}
                isHorizontal
                flexSizeDefault={{
                    'h1': ['1'],
                    'h2': ['4'],
                }}
                dataInput={[
                    {
                        children: LazyBibleList, key: 'h1',
                        widgetName: 'Bible List',
                    },
                    {
                        children: LazyRenderBibleSearch, key: 'h2',
                        widgetName: 'Bible Previewer',
                    },
                ]} />
        </BibleItemViewControllerContext.Provider>
    );
}
