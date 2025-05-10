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
import { BibleViewTitleMaterialContext } from '../bible-reader/BibleViewExtra';
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
                        extraHeader: (
                            <span
                                className="pointer"
                                onClick={() => {
                                    viewController.editBibleItem(bibleItem);
                                }}
                            >
                                <i
                                    style={{ color: 'green' }}
                                    className="bi bi-pencil-fill"
                                />
                            </span>
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
                    onDBClick: (bibleItem: BibleItem) => {
                        viewController.editBibleItem(bibleItem);
                    },
                    extraHeader: (
                        <span
                            className="pointer app-low-hover-visible"
                            style={{ color: 'green' }}
                            onClick={() => {
                                viewController.editBibleItem(bibleItem);
                            }}
                        >
                            <i className="bi bi-pencil" />
                        </span>
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
