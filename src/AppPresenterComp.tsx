import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActorComp from './resize-actor/ResizeActorComp';
import BibleItemViewController, {
    BibleItemViewControllerContext,
} from './bible-reader/BibleItemViewController';
import SlideEditHandlerComp from './app-document-presenter/SlideEditHandlerComp';

const LazyAppPresenterLeft = lazy(() => {
    return import('./AppPresenterLeftComp');
});
const LazyAppPresenterMiddle = lazy(() => {
    return import('./AppPresenterMiddleComp');
});
const LazyAppPresenterRight = lazy(() => {
    return import('./AppPresenterRightComp');
});

const viewController = new BibleItemViewController('presenter');
export default function AppPresenterComp() {
    return (
        <BibleItemViewControllerContext value={viewController}>
            <ResizeActorComp
                flexSizeName={resizeSettingNames.appPresenter}
                isHorizontal
                flexSizeDefault={{
                    h1: ['1'],
                    h2: ['3'],
                    h3: ['2'],
                }}
                dataInput={[
                    {
                        children: LazyAppPresenterLeft,
                        key: 'h1',
                        widgetName: 'App Presenter Left',
                    },
                    {
                        children: LazyAppPresenterMiddle,
                        key: 'h2',
                        widgetName: 'App Presenter Middle',
                    },
                    {
                        children: LazyAppPresenterRight,
                        key: 'h3',
                        widgetName: 'App Presenter Right',
                    },
                ]}
            />
            <SlideEditHandlerComp />
        </BibleItemViewControllerContext>
    );
}
