import { lazy, useMemo } from 'react';

import BibleItem from '../bible-list/BibleItem';
import {
    BibleItemViewControllerContext,
    SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import BibleView from '../bible-reader/BibleView';
import RenderBibleSearchBody from './RenderBibleSearchBody';
import AppSuspenseComp from '../others/AppSuspenseComp';
import {
    useCloseBibleItemRenderer,
    useNextEditingBibleItem,
    useSplitBibleItemRenderer,
} from '../bible-reader/readBibleHelpers';
import { BibleViewTitleMaterialContext } from '../bible-reader/BibleViewExtra';

const LazyBiblePreviewerRender = lazy(() => {
    return import('../bible-reader/BiblePreviewerRender');
});

export default function BibleSearchBodyPreviewer() {
    useNextEditingBibleItem();
    useCloseBibleItemRenderer();
    useSplitBibleItemRenderer();
    const viewController = SearchBibleItemViewController.getInstance();
    const contextValue = useMemo(
        () => ({
            onDBClick: (bibleItem: BibleItem) => {
                viewController.editBibleItem(bibleItem);
            },
        }),
        [viewController],
    );
    viewController.finalRenderer = function (bibleItem: BibleItem) {
        const isSelected = viewController.checkIsBibleItemSelected(bibleItem);
        if (isSelected) {
            return <RenderBibleSearchBody />;
        }
        return (
            <BibleViewTitleMaterialContext value={contextValue}>
                <BibleView bibleItem={bibleItem} />
            </BibleViewTitleMaterialContext>
        );
    };
    return (
        <BibleItemViewControllerContext value={viewController}>
            <AppSuspenseComp>
                <LazyBiblePreviewerRender />
            </AppSuspenseComp>
        </BibleItemViewControllerContext>
    );
}
