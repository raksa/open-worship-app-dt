import { useState } from 'react';

import { useAppEffect } from '../../helper/debuggerHelpers';
import {
    BibleMinimalInfoType, getDownloadedBibleInfoList, getOnlineBibleInfoList,
} from '../../helper/bible-helpers/bibleDownloadHelpers';

export type BibleListType = BibleMinimalInfoType[] | null | undefined;

export function useDownloadedBibleInfoList() {
    const [bibleInfoList, setBibleInfoList] = useState<BibleListType>(null);
    useAppEffect(() => {
        if (bibleInfoList !== null) {
            return;
        }
        getDownloadedBibleInfoList().then((bibleInfoList) => {
            setBibleInfoList(bibleInfoList || undefined);
        });
    }, [bibleInfoList]);
    return [bibleInfoList, setBibleInfoList] as const;
}

export function useOnlineBibleInfoList() {
    const [bibleInfoList, setBibleInfoList] = useState<BibleListType>(null);
    useAppEffect(() => {
        if (bibleInfoList !== null) {
            return;
        }
        getOnlineBibleInfoList().then((bibleInfoList) => {
            setBibleInfoList(bibleInfoList || undefined);
        });
    }, [bibleInfoList]);
    const _setBibleInfoList = (bibleInfoList: BibleListType) => {
        setBibleInfoList(bibleInfoList);
    };
    return [bibleInfoList, _setBibleInfoList] as const;
}
