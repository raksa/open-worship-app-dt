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
    EditingResultContext,
    useLookupBibleItemControllerContext,
} from '../bible-reader/LookupBibleItemController';
import { useAppStateAsync } from '../helper/debuggerHelpers';
import { setBibleLookupInputFocus } from './selectionHelpers';
import { MultiContextRender } from '../helper/MultiContextRender';
import { useInputTextContext } from './InputHandlerComp';

const LazyBiblePreviewerRenderComp = lazy(() => {
    return import('../bible-reader/BiblePreviewerRenderComp');
});

function RenderBodyEditingComp() {
    const viewController = useLookupBibleItemControllerContext();
    const { inputText } = useInputTextContext();
    const { value: editingResult } = useAppStateAsync(() => {
        return viewController.getEditingResult();
    }, [inputText]);
    const selectedBibleItem = viewController.selectedBibleItem;
    const bibleItem = editingResult?.result.bibleItem ?? null;
    return (
        <MultiContextRender
            contexts={[
                {
                    context: BibleViewTitleMaterialContext,
                    value: {
                        titleElement:
                            bibleItem === null ? (
                                <BibleViewTitleWrapperComp
                                    bibleKey={selectedBibleItem.bibleKey}
                                >
                                    {inputText}
                                </BibleViewTitleWrapperComp>
                            ) : (
                                <BibleViewTitleEditingComp
                                    onTargetChange={async (newBibleTarget) => {
                                        bibleItem.target = newBibleTarget;
                                        const title = await bibleItem.toTitle();
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
                    value: selectedBibleItem,
                },
            ]}
        >
            {editingResult ? (
                <EditingResultContext value={editingResult}>
                    <BibleViewComp />
                </EditingResultContext>
            ) : null}
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
