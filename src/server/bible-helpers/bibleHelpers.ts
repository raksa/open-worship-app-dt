import {
    DownloadOptionsType,
    getBibleInfo,
    startDownloadBible,
    getBookKVList,
    getChapterCount,
    getWritableBiblePath,
    toBiblePath,
} from './bibleHelpers1';
import {
    fsCheckDirExist,
    fsDeleteDir,
    fsListDirectories,
} from '../fileHelper';
import { useState, useEffect } from 'react';
import BibleItem from '../../bible-list/BibleItem';

import bibleJson from './bible.json';
import appProvider from '../appProvider';
import { get_api_key, get_api_url } from '../../_owa-crypto';
import { LocaleType } from '../../lang';
import ToastEventListener from '../../event/ToastEventListener';
export const bibleObj = bibleJson as {
    booksOrder: string[],
    books: { [key: string]: BookType },
    kjvKeyValue: { [key: string]: string },
};

export type BookType = {
    key: string,
    chapterCount: number
};

export const toLocaleNum = (n: number, numList: string[]) => {
    if (!numList) {
        return n;
    }
    return `${n}`.split('').map((n1) => {
        return numList[+n1];
    }).join('');
};

export async function genMatches(bibleKey: string, inputText: string) {
    const kjvKeyValue = getKJVKeyValue();
    const bookKVList = await getBookKVList(bibleKey);
    if (bookKVList === null) {
        return null;
    }
    const check = (v1: string, v2: string) => {
        if (v1.toLowerCase().includes(v2.toLowerCase())) {
            return true;
        }
    };
    const keys = Object.keys(bookKVList);
    return keys.filter((k) => {
        const kjvV = kjvKeyValue[k];
        const v = bookKVList[k];
        if (check(kjvV, inputText) || check(inputText, kjvV) ||
            check(k, inputText) || check(inputText, k) ||
            check(v, inputText) || check(inputText, v)) {
            return true;
        }
        return false;
    });
};
export function useMatch(bibleKey: string, inputText: string) {
    const [matches, setMatches] = useState<string[] | null>(null);
    useEffect(() => {
        genMatches(bibleKey, inputText).then((ms) => {
            setMatches(ms);
        });
    }, [bibleKey, inputText]);
    return matches;
}
export function useGetBookKVList(bibleSelected: string) {
    const [bookKVList, setBookKVList] = useState<{
        [key: string]: string;
    } | null>(null);
    useEffect(() => {
        getBookKVList(bibleSelected).then((list) => {
            setBookKVList(list);
        });
    }, [bibleSelected]);
    return bookKVList;
}
export function useGetBibleWithStatus(bibleKey: string) {
    const [bibleStatus, setBibleStatus] = useState<[string, boolean, string] | null>(null);
    useEffect(() => {
        getBibleInfoWithStatus(bibleKey).then((bs) => setBibleStatus(bs));
    }, [bibleKey]);
    return bibleStatus;
}
export function useGetChapterCount(bibleSelected: string, bookSelected: string) {
    const [chapterCount, setChapterCount] = useState<number | null>(null);
    useEffect(() => {
        getChapterCount(bibleSelected, bookSelected).then((chapterCount) => {
            setChapterCount(chapterCount);
        });
    });
    return chapterCount;
}
export function genDuplicatedMessage(list: BibleItem[],
    { target }: BibleItem, i: number) {
    let warningMessage;
    const duplicated = list.find(({ target: target1 }, i1) => {
        return target.book === target1.book &&
            target.chapter === target1.chapter &&
            target.startVerse === target1.startVerse &&
            target.endVerse === target1.endVerse && i !== i1;
    });
    if (duplicated) {
        warningMessage = `Duplicated with item number ${list.indexOf(duplicated) + 1}`;
    }
    return warningMessage;
}

export type BibleMinimalInfoType = {
    locale: LocaleType,
    title: string,
    key: string,
    version: number,
    filePath?: string,
};

export async function downloadBible({
    bibleInfo,
    options,
}: {
    bibleInfo: BibleMinimalInfoType,
    options: DownloadOptionsType,
}) {
    if (bibleInfo.filePath === undefined) {
        return options.onDone(new Error('Invalid file path'));
    }
    try {
        const downloadPath = await getWritableBiblePath();
        if (downloadPath === null) {
            return options.onDone(new Error('Cannot create writable path'));
        }
        await startDownloadBible({
            bibleFileFullName: `/${encodeURI(bibleInfo.filePath)}`,
            fileName: bibleInfo.key,
            options,
        });
    } catch (error: any) {
        options.onDone(error);
    }
}
export async function extractDownloadedBible(archivedFileName: string,
    bibleKey: string) {
    try {
        const downloadPath = await getWritableBiblePath();
        const filePath = await toBiblePath(archivedFileName);
        const bibleDestination = await toBiblePath(bibleKey);
        if (downloadPath === null || filePath === null ||
            bibleDestination === null) {
            return false;
        }
        if (await fsCheckDirExist(bibleDestination)) {
            await fsDeleteDir(bibleDestination);
        }
        await appProvider.fileUtils.tarExtract({
            file: filePath,
            cwd: downloadPath,
        });
        return true;
    } catch (error: any) {
        appProvider.appUtils.handleError(error);
        ToastEventListener.showSimpleToast({
            title: 'Extracting Bible',
            message: 'Fail to extract bible',
        });
    }
    return false;
}

export async function getOnlineBibleInfoList():
    Promise<BibleMinimalInfoType[] | null> {
    try {
        const apiUrl = get_api_url();
        const apiKey = get_api_key();
        const content = await fetch(`${apiUrl}/info.json`, {
            headers: {
                'x-api-key': apiKey,
            },
        });
        const json = await content.json();
        if (typeof json.mapper !== 'object') {
            throw new Error('Cannot get bible list');
        }
        return Object.entries(json.mapper).map(([key, value]:
            [key: string, value: any]) => {
            return {
                locale: value.locale,
                title: value.title,
                key,
                version: value.version,
                filePath: value.filePath,
            };
        });
    } catch (error) {
        appProvider.appUtils.handleError(error);
    }
    return null;
}

export function getKJVKeyValue() {
    return bibleObj.kjvKeyValue;
}

export async function getDownloadedBibleInfoList() {
    const writableBiblePath = await getWritableBiblePath();
    if (writableBiblePath === null) {
        return null;
    }
    const directoryNames = await fsListDirectories(writableBiblePath);
    const promises = directoryNames.map(async (bibleKey) => {
        return getBibleInfo(bibleKey);
    });
    try {
        const infoList = await Promise.all(promises);
        return infoList.filter((info) => {
            return info !== null;
        }) as BibleMinimalInfoType[];
    } catch (error) {
        appProvider.appUtils.handleError(error);
    }
    return null;
}

async function getBibleInfoWithStatus(bibleKey: string):
    Promise<[string, boolean, string]> {
    const bibleInfo = await getBibleInfo(bibleKey);
    const isAvailable = bibleInfo !== null;
    return [bibleKey, isAvailable, `${!isAvailable ? '🚫' : ''}${bibleKey}`];
}

export async function getBibleInfoWithStatusList() {
    const list: [string, boolean, string][] = [];
    const bibleListOnline = await getOnlineBibleInfoList();
    if (bibleListOnline === null) {
        return list;
    }
    for (const bible of bibleListOnline) {
        list.push(await getBibleInfoWithStatus(bible.key));
    }
    return list;
}

async function toChapter(bibleKey: string, bookKey: string,
    chapterNum: number) {
    // KJV, GEN, 1
    const info = await getBibleInfo(bibleKey);
    if (info === null) {
        return null;
    }
    const book = info.books[bookKey];
    return `${book} ${info.numList === undefined ? chapterNum :
        toLocaleNum(chapterNum, info.numList)}`;
}

export function getKJVChapterCount(bookKey: string) {
    // KJV, GEN
    return bibleObj.books[bookKey].chapterCount;
}

export function toChapterList(bibleKey: string, bookKey: string) {
    // KJV, GEN
    const chapterCount = getKJVChapterCount(bookKey);
    return Array.from({ length: chapterCount }, (_, i) => {
        return toChapter(bibleKey, bookKey, i + 1);
    });
}

function toIndex(bookKey: string, chapterNum: number) {
    chapterNum = +chapterNum;
    let index = -1;
    let bIndex = 0;
    while (bibleObj.booksOrder[bIndex]) {
        const bookKey1 = bibleObj.booksOrder[bIndex];
        const chapterCount = bibleObj
            .books[bookKey1].chapterCount;
        if (bookKey1 === bookKey) {
            if (chapterNum > chapterCount) {
                return -1;
            }
            index += chapterNum;
            break;
        }
        index += chapterCount;
        bIndex++;
    }
    return index;
}

export function toFileName(bookKey: string, chapterNum: number) {
    const index = toIndex(bookKey, chapterNum);
    if (index < 0) {
        throw new Error('Invalid chapter number');
    }
    let indexStr = `000${index}`;
    indexStr = indexStr.substring(indexStr.length - 4);
    return `${indexStr}-${bookKey}.${chapterNum}.json`;
}

export async function toBookKey(bibleKey: string, book: string) {
    const info = await getBibleInfo(bibleKey);
    if (info !== null) {
        for (const k in info.books) {
            if (info.books[k] === book) {
                return k;
            }
        }
    }
    return null;
}
