import { useState } from 'react';
import { BibleItemContext } from '../bible-reader/BibleItemContext';
import RefRendererComp from '../bible-refs/RefRendererComp';
import BibleItem from '../bible-list/BibleItem';
import { useAppEffect } from '../helper/debuggerHelpers';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';
import { bibleRenderHelper } from '../bible-list/bibleRenderHelpers';

export default function BibleCrossReferentPreviewerComp() {
    const [bileItem, setBileItem] = useState<BibleItem | null>(null);
    useAppEffect(() => {
        const viewController = LookupBibleItemViewController.getInstance();
        viewController.setBibleVerseKey = (bibleVerseKey: string) => {
            if (!bibleVerseKey) {
                return;
            }
            const extracted =
                bibleRenderHelper.fromBibleVerseKey(bibleVerseKey);
            const newBibleItem = BibleItem.fromJson({
                id: -1,
                bibleKey: extracted.bibleKey,
                target: {
                    bookKey: extracted.bookKey,
                    chapter: extracted.chapter,
                    verseStart: extracted.verseStart,
                    verseEnd: extracted.verseEnd,
                },
                metadata: {},
            });
            setBileItem(newBibleItem);
        };
        viewController.setBibleVerseKey(viewController.bibleVerseKey);
        return () => {
            viewController.setBibleVerseKey = (_: string) => {};
        };
    }, []);
    if (bileItem === null) {
        return (
            <div>
                <h4>Wait...</h4>
                <p>Please select any bible verse.</p>
            </div>
        );
    }
    return (
        <BibleItemContext value={bileItem}>
            <RefRendererComp />
        </BibleItemContext>
    );
}
