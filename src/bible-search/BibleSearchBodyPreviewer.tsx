import { lazy, useMemo } from 'react';

import BibleItem from '../bible-list/BibleItem';
import {
    BibleItemViewControllerContext, SearchBibleItemViewController,
} from '../read-bible/BibleItemViewController';
import BibleView from '../read-bible/BibleView';
import RenderBibleSearchBody from './RenderBibleSearchBody';
import AppSuspense from '../others/AppSuspense';
import {
    useCloseBibleItemRenderer, useNextEditingBibleItem,
    useSplitBibleItemRenderer,
} from '../read-bible/readBibleHelper';
import { BibleViewTitleMaterialContext } from '../read-bible/BibleViewExtra';

const BiblePreviewerRender = lazy(() => {
    return import('../read-bible/BiblePreviewerRender');
});

export default function BibleSearchBodyPreviewer({ inputText }: Readonly<{
    inputText: string,
}>) {
    useNextEditingBibleItem('ArrowLeft');
    useNextEditingBibleItem('ArrowRight');
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
            return (<RenderBibleSearchBody inputText={inputText} />);
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
