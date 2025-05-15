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
    BibleViewTitleEditingComp,
    BibleViewTitleMaterialContext,
} from '../bible-reader/BibleViewExtra';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';
import { setBibleLookupInputFocus } from './selectionHelpers';

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
                            >
                                <span
                                    className="pointer app-caught-hover"
                                    title='Hit "Escape" to force edit'
                                    onClick={() => {
                                        setBibleLookupInputFocus();
                                    }}
                                >
                                    <i
                                        style={{ color: 'green' }}
                                        className="bi bi-pencil-fill"
                                    />
                                </span>
                            </BibleViewTitleEditingComp>
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
                        <BibleViewTitleEditingComp
                            onTargetChange={(newBibleTarget) => {
                                bibleItem.target = newBibleTarget;
                                viewController.changeBibleItem(
                                    bibleItem,
                                    bibleItem,
                                );
                            }}
                        >
                            <span
                                className={
                                    'pointer app-low-hover-visible ' +
                                    'app-caught-hover'
                                }
                                title='Hit "Escape" to force edit'
                                onClick={() => {
                                    viewController.editBibleItem(bibleItem);
                                }}
                            >
                                <i
                                    style={{ color: 'green' }}
                                    className="bi bi-pencil"
                                />
                            </span>
                        </BibleViewTitleEditingComp>
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
