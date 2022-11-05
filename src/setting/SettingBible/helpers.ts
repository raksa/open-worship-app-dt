import { useState, useEffect } from 'react';
import bibleHelper, {
    BibleMinimalInfoType,
} from '../../server/bible-helpers/bibleHelpers';

export type BibleListType = BibleMinimalInfoType[] | null | undefined;

export function useDownloadedBibleList() {
    const [bibleList, setBibleList] = useState<BibleListType>(null);
    useEffect(() => {
        if (bibleList !== null) {
            return;
        }
        bibleHelper.getDownloadedBibleList().then((bbList) => {
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
        bibleHelper.getOnlineBibleList().then((bbList) => {
            setBibleList(bbList || undefined);
        });
    });
    return [bibleList, setBibleList] as const;
}
