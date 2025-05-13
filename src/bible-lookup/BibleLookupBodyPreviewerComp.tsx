import { lazy } from 'react';

import BibleItem from '../bible-list/BibleItem';
import { BibleItemViewControllerContext } from '../bible-reader/BibleItemViewController';
import BibleViewComp from '../bible-reader/BibleViewComp';
import RenderBibleLookupBodyComp from './RenderBibleLookupBodyComp';
import AppSuspenseComp from '../others/AppSuspenseComp';
import {
    useCloseBibleItemRenderer,
    useNextEditingBibleItem,
    useSplitBibleItemRenderer,
} from '../bible-reader/readBibleHelpers';
import {
    BibleViewTitleComp,
    BibleViewTitleEditingComp,
    BibleViewTitleMaterialContext,
} from '../bible-reader/BibleViewExtra';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';

const LazyBiblePreviewerRenderComp = lazy(() => {
    return import('../bible-reader/BiblePreviewerRenderComp');
});

export default function BibleLookupBodyPreviewerComp() {
    useNextEditingBibleItem();
    useCloseBibleItemRenderer();
    useSplitBibleItemRenderer();
    const viewController = LookupBibleItemViewController.getInstance();
    viewController.finalRenderer = function (bibleItem: BibleItem) {
        const isSelected = viewController.checkIsBibleItemSelected(bibleItem);
        if (isSelected) {
            return (
                <BibleViewTitleMaterialContext
                    value={{
                        titleElement: (
                            <BibleViewTitleEditingComp
                                onTargetChange={(newBibleTarget) => {
                                    const bibleItem =
                                        viewController.selectedBibleItem;
                                    bibleItem.target = newBibleTarget;
                                    bibleItem.toTitle().then((title) => {
                                        viewController.inputText = title;
                                    });
                                }}
                            />
                        ),
                    }}
                >
                    <RenderBibleLookupBodyComp />
                </BibleViewTitleMaterialContext>
            );
        }
        return (
            <BibleViewTitleMaterialContext
                value={{
                    titleElement: (
                        <BibleViewTitleComp
                            onDBClick={() => {
                                viewController.editBibleItem(bibleItem);
                            }}
                            onPencilClick={() => {
                                viewController.editBibleItem(bibleItem);
                            }}
                        />
                    ),
                }}
            >
                <BibleViewComp bibleItem={bibleItem} />
            </BibleViewTitleMaterialContext>
        );
    };
    return (
        <BibleItemViewControllerContext value={viewController}>
            <AppSuspenseComp>
                <LazyBiblePreviewerRenderComp />
            </AppSuspenseComp>
        </BibleItemViewControllerContext>
    );
}
