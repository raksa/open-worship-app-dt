import { createContext, use } from 'react';

import BibleItem from '../bible-list/BibleItem';

export const BibleItemContext = (
    createContext<BibleItem | null>(null)
);

export function useBibleItemContext() {
    const bibleItem = use(BibleItemContext);
    if (bibleItem === null) {
        throw new Error('BibleItemContext is null');
    }
    return bibleItem;
}
