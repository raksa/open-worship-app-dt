import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';
import BibleItemViewController, {
    BibleItemViewControllerContext,
} from './bible-reader/BibleItemViewController';
import HandleItemSlideEdit from './slide-presenter/HandleItemSlideEdit';

const LazyAppPresenterLeft = lazy(() => {
    return import('./AppPresenterLeft');
});
const LazyAppPresenterMiddle = lazy(() => {
    return import('./AppPresenterMiddle');
});
const LazyAppPresenterRight = lazy(() => {
    return import('./AppPresenterRight');
});

const viewController = new BibleItemViewController('presenter');
export default function AppPresenter() {
    return (
        <BibleItemViewControllerContext value={viewController}>
            <ResizeActor fSizeName={resizeSettingNames.appPresenter}
                isHorizontal
                flexSizeDefault={{
                    'h1': ['1'],
                    'h2': ['3'],
                    'h3': ['2'],
                }}
                dataInput={[
                    {
                        children: LazyAppPresenterLeft, key: 'h1',
                        widgetName: 'App Presenter Left',
                    },
                    {
                        children: LazyAppPresenterMiddle, key: 'h2',
                        widgetName: 'App Presenter Middle',
                    },
                    {
                        children: LazyAppPresenterRight, key: 'h3',
                        widgetName: 'App Presenter Right',
                    },
                ]} />
            <HandleItemSlideEdit />
        </BibleItemViewControllerContext>
    );
}
