import { useEffect, useState } from 'react';
import { useBibleItemSelecting } from '../event/PreviewingEventListener';
import BibleItem from '../bible-list/BibleItem';
import BibleList from '../bible-list/BibleList';
import BiblePreviewerRender from './BiblePreviewerRender';

export default function BiblePreviewer() {
    const [bibleItem, setBibleItem] = useState<
        BibleItem | null | undefined>(null);
    useBibleItemSelecting(setBibleItem);
    useEffect(() => {
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
