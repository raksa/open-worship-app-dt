import { useState } from 'react';
import {
    useBibleItemSelecting,
} from '../event/PreviewingEventListener';
import BibleItem from '../bible-list/BibleItem';
import BibleList from '../bible-list/BibleList';
import BiblePreviewerRender from './BiblePreviewerRender';
import { useAppEffect } from '../helper/debuggerHelpers';

export default function BiblePreviewer() {
    const [bibleItem, setBibleItem] = useState<
        BibleItem | null | undefined>(null);
    useBibleItemSelecting(setBibleItem);
    useAppEffect(() => {
        if (bibleItem === null) {
            BibleItem.getSelectedItem().then((item) => {
                setBibleItem(item || undefined);
            });
        }
    }, [bibleItem]);

    if (bibleItem === null) {
        return (
            <BibleList />
        );
    }
    if (bibleItem === undefined) {
        return (
            <BibleList />
        );
    }
    return (
        <BiblePreviewerRender bibleItem={bibleItem} />
    );
}
