import { lazy } from 'react';

import BibleItem from '../bible-list/BibleItem';
import { BibleItemsViewControllerContext } from '../bible-reader/BibleItemsViewController';
import BibleViewComp from '../bible-reader/BibleViewComp';
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
import { setBibleLookupInputFocus } from './selectionHelpers';
import { BibleItemContext } from '../bible-reader/BibleItemContext';
import { useLookupBibleItemControllerContext } from '../bible-reader/LookupBibleItemController';

const LazyBiblePreviewerRenderComp = lazy(() => {
    return import('../bible-reader/BiblePreviewerRenderComp');
});

function RenderBodyComp({
    bibleItem,
    titleElement,
}: Readonly<{
    bibleItem: BibleItem;
    titleElement: React.ReactNode;
}>) {
    return (
        <BibleViewTitleMaterialContext
            value={{
                titleElement,
            }}
        >
            <BibleItemContext value={bibleItem}>
                <BibleViewComp />
            </BibleItemContext>
        </BibleViewTitleMaterialContext>
    );
}

export default function BibleLookupBodyPreviewerComp() {
    useNextEditingBibleItem();
    useCloseBibleItemRenderer();
    useSplitBibleItemRenderer();
    const viewController = useLookupBibleItemControllerContext();
    viewController.finalRenderer = function (bibleItem: BibleItem) {
        const isSelected = viewController.checkIsBibleItemSelected(bibleItem);
        return (
            <RenderBodyComp
                bibleItem={bibleItem}
                titleElement={
                    isSelected ? (
                        <BibleViewTitleEditingComp
                            onTargetChange={(newBibleTarget) => {
                                viewController.applyTargetOrBibleKey(
                                    bibleItem,
                                    {
                                        target: newBibleTarget,
                                    },
                                );
                                viewController.syncTargetByColorNote(bibleItem);
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
                    ) : (
                        <BibleViewTitleEditingComp
                            onTargetChange={(newBibleTarget) => {
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
                    )
                }
            />
        );
    };
    return (
        <BibleItemsViewControllerContext value={viewController}>
            <AppSuspenseComp>
                <LazyBiblePreviewerRenderComp />
            </AppSuspenseComp>
        </BibleItemsViewControllerContext>
    );
}
