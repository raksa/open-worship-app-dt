import {
    DownloadOptionsType,
    getInfo,
    startDownloading,
    fetch,
    getBookKVList,
    getChapterCount,
} from './helpers1';
import { getUserWritablePath } from '../helper/appHelper';
import { toBase64, fromBase64 } from '../helper/helpers';
import appProvider from '../helper/appProvider';
import { setSetting, getSetting } from '../helper/settingHelper';
import fileHelpers from '../helper/fileHelper';
import { useState, useEffect } from 'react';
import { BiblePresentType } from '../full-text-present/fullTextPresentHelper';

const bibleObj = appProvider.bibleObj;

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

export async function genMatches(bible: string, inputText: string) {
    const kjvKeyValue = bibleHelper.getKJVKeyValue();
    const bookKVList = await getBookKVList(bible);
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
export function useMatch(bible: string, inputText: string) {
    const [matches, setMatches] = useState<string[] | null>(null);
    useEffect(() => {
        genMatches(bible, inputText).then((ms) => {
            setMatches(ms);
        });
    }, [bible, inputText]);
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
export function useGetBibleWithStatus(bible: string) {
    const [bibleStatus, setBibleStatus] = useState<[string, boolean, string] | null>(null);
    useEffect(() => {
        bibleHelper.getBibleWithStatus(bible).then((bs) => setBibleStatus(bs));
    }, [bible]);
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
export function genDuplicatedMessage(list: BiblePresentType[],
    { target }: BiblePresentType, i: number) {
    let warningMessage;
    const duplicated = list.find(({ target: target1 }, i1) => {
        return target.book === target1.book &&
            target.chapter === target1.chapter &&
            target.startVerse === target1.startVerse &&
            target.endVerse === target1.endVerse && i != i1;
    });
    if (duplicated) {
        warningMessage = `Duplicated with item number ${list.indexOf(duplicated) + 1}`;
    }
    return warningMessage;
}

const bibleHelper = {
    async download(bible: string, options: DownloadOptionsType) {
        try {
            await this.delete(bible);
            const downloadPath = await this.getWritablePath();
            if (downloadPath === null) {
                return options.onDone(new Error('Cannot create writable path'));
            }
            const data: {
                cipherKey: string,
                key: string,
                name: string,
                version: string,
            } = await fetch(`/pointers/${encodeURI(bible + '.json')}`);
            this.setBibleCipherKey(bible, data.cipherKey);
            if (this.getBibleCipherKey(bible) !== data.cipherKey) {
                return options.onDone(new Error('Fail to save!'));
            }
            await startDownloading(`/${encodeURI(data.key)}`, downloadPath, data.name, options);
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
        for (const bible of this.getBibleList()) {
            if (await this.checkExist(bible)) {
                list.push(bible);
            }
        }
        return list;
    },
    async getBibleWithStatus(bible: string): Promise<[string, boolean, string]> {
        const isAvailable = !!await this.checkExist(bible);
        return [bible, isAvailable, `${!isAvailable ? '🚫' : ''}${bible}`];
    },
    async getBibleListWithStatus(): Promise<[string, boolean, string][]> {
        const list = [];
        for (const bible of this.getBibleList()) {
            list.push(await this.getBibleWithStatus(bible));
        }
        return list;
    },
    async getWritablePath() {
        const dirPath = appProvider.path.join(getUserWritablePath(), 'bibles');
        try {
            await fileHelpers.createDir(dirPath);
        } catch (error: any) {
            console.log(error);
            return null;
        }
        return appProvider.path.join(getUserWritablePath(), 'bibles');
    },
    async toDbPath(bible: string) {
        const dirPath = await this.getWritablePath();
        if (dirPath === null) {
            return null;
        }
        return appProvider.path.join(dirPath, bible);

    },
    async checkExist(bible: string) {
        const biblePath = await this.toDbPath(bible);
        if (biblePath === null) {
            return false;
        }
        if (this.getBibleCipherKey(bible) === null) {
            return false;
        }
        return !!await fileHelpers.checkFileExist(biblePath);

    },
    async delete(bible: string) {
        const basePath = await this.getWritablePath() as string;
        const filePath = appProvider.path.join(basePath, bible);
        await fileHelpers.deleteFile(filePath);
        this.setBibleCipherKey(bible, null);
    },
    setBibleCipherKey(bible: string, key: string | null) {
        setSetting(toBase64(`ck-${bible}`), toBase64(key || ''));
    },
    getBibleCipherKey(bible: string) {
        const saved = getSetting(toBase64(`ck-${bible}`));
        return saved ? fromBase64(saved) : null;
    },
    async toChapter(bible: string, bookKey: string, chapterNum: number) {
        // KJV, GEN, 1
        const info = await getInfo(bible);
        if (info === null) {
            return null;
        }
        const book = info.books[bookKey];
        return `${book} ${info.numList === undefined ? chapterNum : toLocaleNum(chapterNum, info.numList)}`;
    },
    getKJVChapterCount(bookKey: string) {
        // KJV, GEN
        return bibleObj.books[bookKey].chapterCount;
    },
    toChapterList(bible: string, bookKey: string) {
        // KJV, GEN
        const chapterCount = this.getKJVChapterCount(bookKey);
        return Array.from({ length: chapterCount }, (_, i) => {
            return this.toChapter(bible, bookKey, i + 1);
        });
    },
    toIndex(bookKey: string, chapterNum: number) {
        chapterNum = +chapterNum;
        let index = -1;
        let bIndex = 0;
        while (bibleObj.booksOrder[bIndex]) {
            const bookKey1 = bibleObj.booksOrder[bIndex];
            const chapterCount = bibleObj.books[bookKey1].chapterCount;
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
    async toBookKey(bible: string, book: string) {
        const info = await getInfo(bible);
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
