import { lazy, useMemo } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';
import BibleItemViewController, {
    BibleItemViewControllerContext,
} from './read-bible/BibleItemViewController';
import BibleView from './read-bible/BibleView';
import BibleItem from './bible-list/BibleItem';

const BibleList = lazy(() => {
    return import('./bible-list/BibleList');
});
const BiblePreviewerRender = lazy(() => {
    return import('./read-bible/BiblePreviewerRender');
});

export default function AppReader() {
    const bibleItemViewController = useMemo(() => {
        const bibleItemViewController = new BibleItemViewController('reader');
        bibleItemViewController.finalRenderer = (bibleItem: BibleItem) => {
            return (<BibleView
                bibleItem={bibleItem}
            />);
        };
        return bibleItemViewController;
    }, []);
    return (
        <BibleItemViewControllerContext.Provider
            value={bibleItemViewController}>
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
