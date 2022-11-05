import { useState, useEffect } from 'react';
import {
    BibleMinimalInfoType,
    getDownloadedBibleList,
    getOnlineBibleList,
} from '../../server/bible-helpers/bibleHelpers';

export type BibleListType = BibleMinimalInfoType[] | null | undefined;

export function useDownloadedBibleList() {
    const [bibleList, setBibleList] = useState<BibleListType>(null);
    useEffect(() => {
        if (bibleList !== null) {
            return;
        }
        getDownloadedBibleList().then((bbList) => {
            setBibleList(bbList || undefined);
        });
    });
    return [bibleList, setBibleList] as const;
}

export function useOnlineBibleList() {
    const [bibleList, setBibleList] = useState<BibleListType>(null);
    useEffect(() => {
        if (bibleList !== null) {
            return;
        }
        getOnlineBibleList().then((bbList) => {
            setBibleList(bbList || undefined);
        });
    });
    return [bibleList, setBibleList] as const;
}
