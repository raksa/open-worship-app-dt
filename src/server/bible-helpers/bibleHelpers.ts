import {
    DownloadOptionsType,
    getBibleInfo,
    startDownloading,
    fetch,
    getBookKVList,
    getChapterCount,
} from './helpers1';
import { getUserWritablePath } from '../appHelper';
import { setSetting, getSetting } from '../../helper/settingHelper';
import {
    fsCheckFileExist,
    fsCreateDir,
    fsDeleteFile,
    pathJoin,
} from '../fileHelper';
import { useState, useEffect } from 'react';
import BibleItem from '../../bible-list/BibleItem';
import { toBase64, fromBase64 } from '../helpers';

import bibleJson from './bible.json';
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
    return `${n}`.split('').map(n1 => numList[+n1]).join('');
};

export async function genMatches(bibleName: string, inputText: string) {
    const kjvKeyValue = bibleHelper.getKJVKeyValue();
    const bookKVList = await getBookKVList(bibleName);
    if (bookKVList === null) {
        return null;
    }
    const check = (v1: string, v2: string) => {
        if (~v1.toLowerCase().indexOf(v2.toLowerCase())) {
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
export function useMatch(bibleName: string, inputText: string) {
    const [matches, setMatches] = useState<string[] | null>(null);
    useEffect(() => {
        genMatches(bibleName, inputText).then((ms) => {
            setMatches(ms);
        });
    }, [bibleName, inputText]);
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
export function useGetBibleWithStatus(bibleName: string) {
    const [bibleStatus, setBibleStatus] = useState<[string, boolean, string] | null>(null);
    useEffect(() => {
        bibleHelper.getBibleWithStatus(bibleName).then((bs) => setBibleStatus(bs));
    }, [bibleName]);
    return bibleStatus;
}
export function useGetChapterCount(bibleSelected: string, bookSelected: string) {
    const [chapterCount, setChapterCount] = useState<number | null>(null);
    useEffect(() => {
        getChapterCount(bibleSelected, bookSelected).then((cc) => {
            setChapterCount(cc);
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

const bibleHelper = {
    async download(bibleName: string, options: DownloadOptionsType) {
        try {
            await this.delete(bibleName);
            const downloadPath = await this.getWritablePath();
            if (downloadPath === null) {
                return options.onDone(new Error('Cannot create writable path'));
            }
            const data: {
                cipherKey: string,
                key: string,
                name: string,
                version: string,
            } = await fetch(`/pointers/${encodeURI(bibleName + '.json')}`);
            this.setBibleCipherKey(bibleName, data.cipherKey);
            if (this.getBibleCipherKey(bibleName) !== data.cipherKey) {
                return options.onDone(new Error('Fail to save!'));
            }
            await startDownloading(`/${encodeURI(data.key)}`,
                downloadPath, data.name, options);
        } catch (error: any) {
            options.onDone(error);
        }
    },
    setBibleList(list: string[]) {
        setSetting('bibles-list', JSON.stringify(list));
    },
    getBibleListOnline() {
        return new Promise<boolean>((resolve) => {
            fetch('/info.json').then((data: {
                bibleList: string[],
            }) => {
                this.setBibleList(data.bibleList);
                resolve(true);
            }).catch((error) => {
                console.log(error);
                resolve(false);
            });
        });
    },
    getBibleList() {
        const str = getSetting('bibles-list');
        try {
            const list = JSON.parse(str) as string[];
            if (list.every((s) => typeof s === 'string')) {
                return list;
            }
        } catch (error) {
            console.log(error);
        }
        return [];
    },
    getKJVKeyValue() {
        return bibleObj.kjvKeyValue;
    },
    async getDownloadedBibleList() {
        const list = [];
        for (const bibleName of this.getBibleList()) {
            if (await this.checkExist(bibleName)) {
                list.push(bibleName);
            }
        }
        return list;
    },
    async getBibleWithStatus(bibleName: string): Promise<[string, boolean, string]> {
        const isAvailable = !!await this.checkExist(bibleName);
        return [bibleName, isAvailable, `${!isAvailable ? '🚫' : ''}${bibleName}`];
    },
    async getBibleListWithStatus(): Promise<[string, boolean, string][]> {
        const list = [];
        for (const bibleName of this.getBibleList()) {
            list.push(await this.getBibleWithStatus(bibleName));
        }
        return list;
    },
    async getWritablePath() {
        const dirPath = pathJoin(getUserWritablePath(), 'bibles');
        try {
            await fsCreateDir(dirPath);
        } catch (error: any) {
            console.log(error);
            return null;
        }
        return pathJoin(getUserWritablePath(), 'bibles');
    },
    async toDbPath(bibleName: string) {
        const dirPath = await this.getWritablePath();
        if (dirPath === null) {
            return null;
        }
        return pathJoin(dirPath, bibleName);

    },
    async checkExist(bibleName: string) {
        const biblePath = await this.toDbPath(bibleName);
        if (biblePath === null) {
            return false;
        }
        if (this.getBibleCipherKey(bibleName) === null) {
            return false;
        }
        return !!await fsCheckFileExist(biblePath);

    },
    async delete(bibleName: string) {
        const basePath = await this.getWritablePath() as string;
        const filePath = pathJoin(basePath, bibleName);
        await fsDeleteFile(filePath);
        this.setBibleCipherKey(bibleName, null);
    },
    setBibleCipherKey(bibleName: string, key: string | null) {
        setSetting(toBase64(`ck-${bibleName}`), toBase64(key || ''));
    },
    getBibleCipherKey(bibleName: string) {
        const saved = getSetting(toBase64(`ck-${bibleName}`));
        return saved ? fromBase64(saved) : null;
    },
    async toChapter(bibleName: string, bookKey: string,
        chapterNum: number) {
        // KJV, GEN, 1
        const info = await getBibleInfo(bibleName);
        if (info === null) {
            return null;
        }
        const book = info.books[bookKey];
        return `${book} ${info.numList === undefined ? chapterNum :
            toLocaleNum(chapterNum, info.numList)}`;
    },
    getKJVChapterCount(bookKey: string) {
        // KJV, GEN
        return bibleObj.books[bookKey].chapterCount;
    },
    toChapterList(bibleName: string, bookKey: string) {
        // KJV, GEN
        const chapterCount = this.getKJVChapterCount(bookKey);
        return Array.from({ length: chapterCount }, (_, i) => {
            return this.toChapter(bibleName, bookKey, i + 1);
        });
    },
    toIndex(bookKey: string, chapterNum: number) {
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
    },
    toFileName(bookKey: string, chapterNum: number) {
        const index = this.toIndex(bookKey, chapterNum);
        if (index < 0) {
            throw new Error('Invalid chapter number');
        }
        let indexStr = `000${index}`;
        indexStr = indexStr.substring(indexStr.length - 4);
        return `${indexStr}-${bookKey}.${chapterNum}.json`;
    },
    async toBookKey(bibleName: string, book: string) {
        const info = await getBibleInfo(bibleName);
        if (info !== null) {
            for (const k in info.books) {
                if (info.books[k] === book) {
                    return k;
                }
            }
        }
        return null;
    },
};

export default bibleHelper;
