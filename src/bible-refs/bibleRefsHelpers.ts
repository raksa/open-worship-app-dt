import { useState } from 'react';

import {
    get_api_url, get_api_key, decrypt, bible_ref,
} from '../_owa-crypto';
import { handleError } from '../helper/errorHelpers';
import { toFileName } from '../helper/bible-helpers/serverBibleHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { IndexedDbController } from '../db/dbHelper';

export type RawBibleRefListType = string[][];
export type BibleRefType = {
    text: string;
    isS: boolean;
    isFN: boolean;
    isStar: boolean;
    isTitle: boolean;
    isLXXDSS: boolean;
};


export class BibleRefsDbController extends IndexedDbController {
    get storeName() {
        return 'bible_refs';
    }
    static instantiate() {
        return new this();
    }
}

async function downloadBibleRef(key: string) {
    try {
        const apiUrl = get_api_url();
        const apiKey = get_api_key();
        const content = await fetch(`${apiUrl}/bible-refs/${key}`, {
            headers: {
                'x-api-key': apiKey,
            },
        });
        return await content.text();
    } catch (error) {
        handleError(error);
    }
    return null;
}

async function saveCacheBibleRef(key: string, data: object) {
    try {
        const dbController = await BibleRefsDbController.getInstance();
        return dbController.addItem(key, data, true);
    } catch (error) {
        handleError(error);
    }
}

const MAX_CACHE_DAYS = 7;
const MAX_CACHE_MILLISECONDS = MAX_CACHE_DAYS * 24 * 60 * 60 * 1000;
async function getCacheBibleRef(key: string) {
    try {
        const dbController = await BibleRefsDbController.getInstance();
        const record = await dbController.getItem<RawBibleRefListType>(key);
        if (record === null) {
            return null;
        }
        if (record.updatedAt.getTime() - Date.now() > MAX_CACHE_MILLISECONDS) {
            return null;
        }
        return record.data;
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

export async function getBibleRef(key: string) {
    const cacheData = await getCacheBibleRef(key);
    if (cacheData !== null) {
        return transform(cacheData);
    }
    const encryptedText = await downloadBibleRef(key);
    if (encryptedText === null) {
        return null;
    }
    const text = decrypt(encryptedText);
    try {
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
            saveCacheBibleRef(key, json);
            return transform(json);
        }
    } catch (error) {
        handleError(error);
    }
    return null;
}

export function useGetBibleRef(bookKey: string, chapter: number,
    verseNum: number) {
    const [bibleRef, setBibleRef] = useState<BibleRefType[][] | null>(null);
    useAppEffect(() => {
        const key = `${toFileName(bookKey, chapter)}.${verseNum}`;
        getBibleRef(key).then((data) => {
            setBibleRef(data);
        });
    }, [bookKey, chapter]);
    return bibleRef;
}
