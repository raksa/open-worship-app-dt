import { lazy, useMemo } from 'react';

import BibleItem from '../bible-list/BibleItem';
import {
    BibleItemViewControllerContext,
    SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import BibleViewComp from '../bible-reader/BibleViewComp';
import RenderBibleSearchBodyComp from './RenderBibleSearchBodyComp';
import AppSuspenseComp from '../others/AppSuspenseComp';
import {
    useCloseBibleItemRenderer,
    useNextEditingBibleItem,
    useSplitBibleItemRenderer,
} from '../bible-reader/readBibleHelpers';
import { BibleViewTitleMaterialContext } from '../bible-reader/bibleViewExtra';

const LazyBiblePreviewerRender = lazy(() => {
    return import('../bible-reader/BiblePreviewerRenderComp');
});

export default function BibleSearchBodyPreviewerComp() {
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
            return <RenderBibleSearchBodyComp />;
        }
        return (
            <BibleViewTitleMaterialContext value={contextValue}>
                <BibleViewComp bibleItem={bibleItem} />
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
