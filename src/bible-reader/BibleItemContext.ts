import { createContext, useContext } from 'react';

import BibleItem from '../bible-list/BibleItem';

export const BibleItemContext = (
    createContext<BibleItem | null>(null)
);

export function useBibleItem() {
    const bibleItem = useContext(BibleItemContext);
    if (bibleItem === null) {
        throw new Error('BibleItemContext is null');
    }
    return bibleItem;
}
