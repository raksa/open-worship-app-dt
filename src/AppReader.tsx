import { lazy, useMemo } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';
import BibleItemViewController, {
    BibleItemViewControllerContext,
} from './bible-reader/BibleItemViewController';
import BibleView from './bible-reader/BibleView';
import BibleItem from './bible-list/BibleItem';

const BibleList = lazy(() => {
    return import('./bible-list/BibleList');
});
const BiblePreviewerRender = lazy(() => {
    return import('./bible-reader/BiblePreviewerRender');
});

export default function AppReader() {
    const viewController = useMemo(() => {
        const viewController1 = new BibleItemViewController('reader');
        viewController1.finalRenderer = (bibleItem: BibleItem) => {
            return (<BibleView
                bibleItem={bibleItem}
            />);
        };
        return viewController1;
    }, []);
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
                        children: BibleList, key: 'h1',
                        widgetName: 'Bible List',
                    },
                    {
                        children: BiblePreviewerRender, key: 'h2',
                        widgetName: 'Bible Previewer',
                    },
                ]} />
        </BibleItemViewControllerContext.Provider>
    );
}
