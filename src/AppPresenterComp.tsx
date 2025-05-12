import { lazy, useMemo } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActorComp from './resize-actor/ResizeActorComp';
import BibleItemViewController, {
    BibleItemViewControllerContext,
} from './bible-reader/BibleItemViewController';
import SlideEditHandlerComp from './app-document-presenter/SlideEditHandlerComp';
import BibleViewComp from './bible-reader/BibleViewComp';
import BibleItem from './bible-list/BibleItem';
import {
    BibleViewTitleComp,
    BibleViewTitleMaterialContext,
} from './bible-reader/BibleViewExtra';

const LazyAppPresenterLeftComp = lazy(() => {
    return import('./AppPresenterLeftComp');
});
const LazyAppPresenterMiddleComp = lazy(() => {
    return import('./AppPresenterMiddleComp');
});
const LazyAppPresenterRightComp = lazy(() => {
    return import('./AppPresenterRightComp');
});

export default function AppPresenterComp() {
    const viewController = useMemo(() => {
        const newViewController = new BibleItemViewController('presenter');
        newViewController.finalRenderer = (bibleItem: BibleItem) => {
            return (
                <BibleViewTitleMaterialContext
                    value={{
                        titleElement: <BibleViewTitleComp />,
                    }}
                >
                    <BibleViewComp bibleItem={bibleItem} />
                </BibleViewTitleMaterialContext>
            );
        };
        return newViewController;
    }, []);
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
                        children: LazyAppPresenterLeftComp,
                        key: 'h1',
                        widgetName: 'App Presenter Left',
                    },
                    {
                        children: LazyAppPresenterMiddleComp,
                        key: 'h2',
                        widgetName: 'App Presenter Middle',
                    },
                    {
                        children: LazyAppPresenterRightComp,
                        key: 'h3',
                        widgetName: 'App Presenter Right',
                    },
                ]}
            />
            <SlideEditHandlerComp />
        </BibleItemViewControllerContext>
    );
}
