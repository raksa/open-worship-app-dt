import { useState } from 'react';

import { decrypt, bible_ref } from '../_owa-crypto';
import { handleError } from '../helper/errorHelpers';
import { toBibleFileName } from '../helper/bible-helpers/serverBibleHelpers';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { appApiFetch } from '../helper/networkHelpers';
import { unlocking } from '../server/appHelpers';
import CacheManager from '../others/CacheManager';

export type RawBibleRefListType = string[][];
export type BibleRefType = {
    text: string;
    isS: boolean;
    isFN: boolean;
    isStar: boolean;
    isTitle: boolean;
    isLXXDSS: boolean;
};

async function downloadBibleRef(key: string) {
    try {
        const content = await appApiFetch(`bible-refs/${key}`);
        return await content.text();
    } catch (error) {
        handleError(error);
    }
    return null;
}

function transform(bibleRef: RawBibleRefListType): BibleRefType[][] {
    return bibleRef.map((row) => {
        return row.map((item) => {
            const encoded = bible_ref(item);
            return JSON.parse(encoded);
        });
    });
}

const cache = new CacheManager<BibleRefType[][]>(60 * 60); // 1 hour
export async function getBibleRef(key: string) {
    return unlocking(`bible-refs/${key}`, async () => {
        const cachedData = await cache.get(key);
        if (cachedData !== null) {
            return cachedData;
        }
        const encryptedText = await downloadBibleRef(key);
        if (encryptedText === null) {
            return null;
        }
        const text = decrypt(encryptedText);
        try {
            const json = JSON.parse(text);
            if (Array.isArray(json)) {
                const data = transform(json);
                await cache.set(key, data);
                return data;
            }
        } catch (error) {
            console.error('Error parsing JSON: for key', key);
            handleError(error);
        }
        return null;
    });
}

export function useGetBibleRef(
    bookKey: string,
    chapter: number,
    verseNum: number,
) {
    const [bibleRef, setBibleRef] = useState<BibleRefType[][] | null>(null);
    useAppEffectAsync(
        async (methodContext) => {
            const key = `${toBibleFileName(bookKey, chapter)}.${verseNum}`;
            const data = await getBibleRef(key);
            methodContext.setBibleRef(data);
        },
        [bookKey, chapter],
        { setBibleRef },
    );
    return bibleRef;
}
