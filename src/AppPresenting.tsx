import { lazy, useMemo } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';
import BibleItemViewController, {
    BibleItemViewControllerContext,
} from './read-bible/BibleItemViewController';
import BibleItem from './bible-list/BibleItem';
import BibleView from './read-bible/BibleView';

const AppPresentingLeft = lazy(() => {
    return import('./AppPresentingLeft');
});
const AppPresentingMiddle = lazy(() => {
    return import('./AppPresentingMiddle');
});
const AppPresentingRight = lazy(() => {
    return import('./AppPresentingRight');
});

export default function AppPresenting() {
    const bibleItemViewController = useMemo(() => {
        const bibleItemViewController = new BibleItemViewController(
            'presenting',
        );
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
            <ResizeActor fSizeName={resizeSettingNames.appPresenting}
                flexSizeDefault={{
                    'h1': ['1'],
                    'h2': ['3'],
                    'h3': ['2'],
                }}
                resizeKinds={['h', 'h']}
                dataInput={[
                    [AppPresentingLeft, 'h1', 'flex v'],
                    [AppPresentingMiddle, 'h2', 'flex v'],
                    [AppPresentingRight, 'h3', 'flex v'],
                ]} />
        </BibleItemViewControllerContext.Provider>
    );
}
