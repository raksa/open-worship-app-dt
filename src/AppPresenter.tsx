import { lazy, useMemo } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';
import BibleItemViewController, {
    BibleItemViewControllerContext,
} from './bible-reader/BibleItemViewController';
import BibleItem from './bible-list/BibleItem';
import BibleView from './bible-reader/BibleView';
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
    const viewController = useMemo(() => {
        const viewController1 = new BibleItemViewController(
            'presenter',
        );
        viewController1.finalRenderer = (bibleItem: BibleItem) => {
            return (
                <BibleView
                    bibleItem={bibleItem}
                />
            );
        };
        return viewController1;
    }, []);
    return (
        <BibleItemViewControllerContext.Provider
            value={viewController}>
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
