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
    BibleViewTitleWrapperComp,
} from '../bible-reader/BibleViewExtra';
import { BibleItemContext } from '../bible-reader/BibleItemContext';
import {
    useEditingResultContext,
    useLookupBibleItemControllerContext,
} from '../bible-reader/LookupBibleItemController';
import { setBibleLookupInputFocus } from './selectionHelpers';
import { MultiContextRender } from '../helper/MultiContextRender';

const LazyBiblePreviewerRenderComp = lazy(() => {
    return import('../bible-reader/BiblePreviewerRenderComp');
});

function RenderBodyEditingComp() {
    const viewController = useLookupBibleItemControllerContext();
    const selectedBibleItem = viewController.selectedBibleItem;
    const editingResult = useEditingResultContext();
    const foundBibleItem = editingResult?.result.bibleItem ?? null;
    return (
        <MultiContextRender
            contexts={[
                {
                    context: BibleViewTitleMaterialContext,
                    value: {
                        titleElement:
                            foundBibleItem === null ? (
                                <BibleViewTitleWrapperComp
                                    bibleKey={selectedBibleItem.bibleKey}
                                >
                                    {editingResult?.oldInputText ?? ''}
                                </BibleViewTitleWrapperComp>
                            ) : (
                                <BibleViewTitleEditingComp
                                    onTargetChange={async (newBibleTarget) => {
                                        foundBibleItem.target = newBibleTarget;
                                        const title =
                                            await foundBibleItem.toTitle();
                                        viewController.inputText = title;
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
                    },
                },
                {
                    context: BibleItemContext,
                    value: foundBibleItem,
                },
            ]}
        >
            <BibleViewComp />
        </MultiContextRender>
    );
}

function RenderBodyComp({
    bibleItem,
}: Readonly<{
    bibleItem: BibleItem;
}>) {
    const viewController = useLookupBibleItemControllerContext();
    return (
        <MultiContextRender
            contexts={[
                {
                    context: BibleViewTitleMaterialContext,
                    value: {
                        titleElement: (
                            <BibleViewTitleEditingComp
                                onTargetChange={(newBibleTarget) => {
                                    viewController.applyTargetOrBibleKey(
                                        bibleItem,
                                        {
                                            target: newBibleTarget,
                                        },
                                    );
                                    viewController.syncTargetByColorNote(
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
                    },
                },
                {
                    context: BibleItemContext,
                    value: bibleItem,
                },
            ]}
        >
            <BibleViewComp />
        </MultiContextRender>
    );
}

export default function BibleLookupBodyPreviewerComp() {
    useNextEditingBibleItem();
    useCloseBibleItemRenderer();
    useSplitBibleItemRenderer();
    const viewController = useLookupBibleItemControllerContext();
    viewController.finalRenderer = function (bibleItem: BibleItem) {
        if (!viewController.checkIsBibleItemSelected(bibleItem)) {
            return <RenderBodyComp bibleItem={bibleItem} />;
        }
        return <RenderBodyEditingComp />;
    };
    return (
        <BibleItemsViewControllerContext value={viewController}>
            <AppSuspenseComp>
                <LazyBiblePreviewerRenderComp />
            </AppSuspenseComp>
        </BibleItemsViewControllerContext>
    );
}
