import { useState } from 'react';
import { BibleItemContext } from '../bible-reader/BibleItemContext';
import RefRendererComp from '../bible-refs/RefRendererComp';
import BibleItem from '../bible-list/BibleItem';
import { useAppEffect } from '../helper/debuggerHelpers';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';
import { bibleRenderHelper } from '../bible-list/bibleRenderHelpers';

export default function BibleCrossReferentPreviewerComp() {
    const [bileItem, setBileItem] = useState<BibleItem | null>(null);
    const viewController = LookupBibleItemViewController.getInstance();
    useAppEffect(() => {
        viewController.setKJVBibleVerseKey = (kjvBibleVerseKey: string) => {
            const extracted =
                bibleRenderHelper.fromKJVBibleVersesKey(kjvBibleVerseKey);
            const newBibleItem = BibleItem.fromJson({
                id: -1,
                bibleKey: 'KJV',
                target: {
                    bookKey: extracted.book,
                    chapter: extracted.chapter,
                    verseStart: extracted.verseStart,
                    verseEnd: extracted.verseEnd,
                },
                metadata: {},
            });
            setBileItem(newBibleItem);
        };
        return () => {
            viewController.setKJVBibleVerseKey = (_: string) => {};
        };
    }, [setBileItem]);
    if (bileItem === null) {
        return (
            <div>
                <h1>Wait...</h1>
                <p>Please select any bible verse.</p>
            </div>
        );
    }
    return (
        <BibleItemContext value={bileItem}>
            <RefRendererComp />;
        </BibleItemContext>
    );
}
