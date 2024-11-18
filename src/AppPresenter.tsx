import { lazy, useMemo } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';
import BibleItemViewController, {
    BibleItemViewControllerContext,
} from './read-bible/BibleItemViewController';
import BibleItem from './bible-list/BibleItem';
import BibleView from './read-bible/BibleView';
import HandleItemSlideEdit from './slide-presenter/HandleItemSlideEdit';

const AppPresenterLeft = lazy(() => {
    return import('./AppPresenterLeft');
});
const AppPresenterMiddle = lazy(() => {
    return import('./AppPresenterMiddle');
});
const AppPresenterRight = lazy(() => {
    return import('./AppPresenterRight');
});

export default function AppPresenter() {
    const bibleItemViewController = useMemo(() => {
        const bibleItemViewController = new BibleItemViewController(
            'presenter',
        );
        bibleItemViewController.finalRenderer = (bibleItem: BibleItem) => {
            return (
                <BibleView
                    bibleItem={bibleItem}
                />
            );
        };
        return bibleItemViewController;
    }, []);
    return (
        <BibleItemViewControllerContext.Provider
            value={bibleItemViewController}>
            <ResizeActor fSizeName={resizeSettingNames.appPresenter}
                isHorizontal
                flexSizeDefault={{
                    'h1': ['1'],
                    'h2': ['3'],
                    'h3': ['2'],
                }}
                dataInput={[
                    {
                        children: AppPresenterLeft, key: 'h1',
                        widgetName: 'App Presenter Left',
                    },
                    {
                        children: AppPresenterMiddle, key: 'h2',
                        widgetName: 'App Presenter Middle',
                    },
                    {
                        children: AppPresenterRight, key: 'h3',
                        widgetName: 'App Presenter Right',
                    },
                ]} />
            <HandleItemSlideEdit />
        </BibleItemViewControllerContext.Provider>
    );
}
