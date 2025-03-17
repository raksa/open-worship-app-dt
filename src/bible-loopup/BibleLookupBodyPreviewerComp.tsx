import { lazy, useMemo } from 'react';

import BibleItem from '../bible-list/BibleItem';
import {
    BibleItemViewControllerContext,
    LookupBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import BibleViewComp from '../bible-reader/BibleViewComp';
import RenderBibleLookupBodyComp from './RenderBibleLookupBodyComp';
import AppSuspenseComp from '../others/AppSuspenseComp';
import {
    useCloseBibleItemRenderer,
    useNextEditingBibleItem,
    useSplitBibleItemRenderer,
} from '../bible-reader/readBibleHelpers';
import { BibleViewTitleMaterialContext } from '../bible-reader/BibleViewExtra';

const LazyBiblePreviewerRender = lazy(() => {
    return import('../bible-reader/BiblePreviewerRenderComp');
});

export default function BibleLookupBodyPreviewerComp() {
    useNextEditingBibleItem();
    useCloseBibleItemRenderer();
    useSplitBibleItemRenderer();
    const viewController = LookupBibleItemViewController.getInstance();
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
            return <RenderBibleLookupBodyComp />;
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
