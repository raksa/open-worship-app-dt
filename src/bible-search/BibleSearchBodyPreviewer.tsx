import { lazy, useMemo } from 'react';

import BibleItem from '../bible-list/BibleItem';
import {
    BibleItemViewControllerContext, SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import BibleView from '../bible-reader/BibleView';
import RenderBibleSearchBody from './RenderBibleSearchBody';
import AppSuspense from '../others/AppSuspense';
import {
    useCloseBibleItemRenderer, useNextEditingBibleItem,
    useSplitBibleItemRenderer,
} from '../bible-reader/readBibleHelper';
import { BibleViewTitleMaterialContext } from '../bible-reader/BibleViewExtra';

const BiblePreviewerRender = lazy(() => {
    return import('../bible-reader/BiblePreviewerRender');
});

export default function BibleSearchBodyPreviewer() {
    useNextEditingBibleItem();
    useCloseBibleItemRenderer();
    useSplitBibleItemRenderer('s');
    useSplitBibleItemRenderer('v');
    const bibleItemViewController = SearchBibleItemViewController.getInstance();
    const contextValue = useMemo(() => ({
        onDBClick: (bibleItem: BibleItem) => {
            bibleItemViewController.editBibleItem(bibleItem);
        },
    }), [bibleItemViewController]);
    bibleItemViewController.finalRenderer = function (bibleItem: BibleItem) {
        const isSelected = bibleItemViewController.checkIsBibleItemSelected(
            bibleItem,
        );
        if (isSelected) {
            return (<RenderBibleSearchBody />);
        }
        return (
            <BibleViewTitleMaterialContext.Provider value={contextValue}>
                <BibleView bibleItem={bibleItem} />
            </BibleViewTitleMaterialContext.Provider>
        );
    };
    return (
        <BibleItemViewControllerContext.Provider
            value={bibleItemViewController}>
            <AppSuspense>
                <BiblePreviewerRender />
            </AppSuspense>
        </BibleItemViewControllerContext.Provider>
    );
}
