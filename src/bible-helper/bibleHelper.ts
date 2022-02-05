import {
    DownloadOptionsType,
    getInfo,
    startDownloading,
    fetch,
} from './helpers';
import { getUserWritablePath } from '../helper/appHelper';
import { toBase64, fromBase64 } from '../helper/helpers';
import appProvider from '../helper/appProvider';
import { setSetting, getSetting } from '../helper/settingHelper';
import { checkFileExist } from '../helper/fileHelper';

const bibleObj = appProvider.bibleObj;

export type BookType = {
    key: string,
    chapterCount: number
};

const toLocaleNum = (n: number, numList: string[]) => {
    if (!numList) {
        return n;
    }
    return `${n}`.split('').map(n1 => numList[+n1]).join('');
};

const bibleHelper = {
    download(bible: string, options: DownloadOptionsType) {
        this.delete(bible);
        const downloadPath = this.getWritablePath();
        if (downloadPath === null) {
            return options.onDone(new Error('Cannot creat writable path'));
        }
        fetch(`/pointers/${encodeURI(`${bible}.json`)}`).then((data: {
            cipherKey: string,
            key: string,
            name: string,
            version: string,
        }) => {
            this.setBibleCipherKey(bible, data.cipherKey);
            if (this.getBibleCipherKey(bible) !== data.cipherKey) {
                return options.onDone(new Error('Fail to save!'));
            }
            startDownloading(`/${encodeURI(`${data.key}`)}`, downloadPath, data.name, options);
        }).catch((error) => {
            options.onDone(error);
        });
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
    getDownloadedBibleList() {
        return this.getBibleList().filter((bible) => {
            return this.checkExist(bible);
        });
    },
    getBibleWithStatus(bible: string): [string, boolean, string] {
        const isAvailable = !!this.checkExist(bible);
        return [bible, isAvailable, `${!isAvailable ? '🚫' : ''}${bible}`];
    },
    getBibleListWithStatus(): [string, boolean, string][] {
        return this.getBibleList().map((bible) => this.getBibleWithStatus(bible));
    },
    getWritablePath() {
        const dirPath = appProvider.path.join(getUserWritablePath(), 'bibles');
        try {
            appProvider.fs.mkdirSync(dirPath);
        } catch (error: any) {
            if (!~error.message.indexOf('file already exists')) {
                return null;
            }
        }
        return appProvider.path.join(getUserWritablePath(), 'bibles');
    },
    toDbPath(bible: string) {
        const dirPath = this.getWritablePath();
        if (dirPath === null) {
            return null;
        }
        const biblePath = appProvider.path.join(dirPath, bible);
        return biblePath;

    },
    checkExist(bible: string) {
        const biblePath = this.toDbPath(bible);
        if (biblePath === null) {
            return null;
        }
        if (this.getBibleCipherKey(bible) === null) {
            return false;
        }
        return !!checkFileExist(biblePath);

    },
    delete(bible: string) {
        try {
            const basePath = this.getWritablePath() as string;
            const filePath = appProvider.path.join(basePath, bible);
            appProvider.fs.unlinkSync(filePath);
            this.setBibleCipherKey(bible, null);
        } catch (error) {
            console.log(error);
        }
    },
    setBibleCipherKey(bible: string, key: string | null) {
        setSetting(toBase64(`ck-${bible}`), toBase64(key || ''));
    },
    getBibleCipherKey(bible: string) {
        const saved = getSetting(toBase64(`ck-${bible}`));
        return saved ? fromBase64(saved) : null;
    },
    getBookList(bible: string) {
        // KJV
        const info = getInfo(bible);
        return info === null ? null : Object.values(info.books);
    },
    toChapter(bible: string, bookKey: string, chapterNum: number) {
        // KJV, GEN, 1
        const info = getInfo(bible);
        if (info === null) {
            return null;
        }
        const book = info.books[bookKey];
        return `${book} ${info.numList === undefined ? chapterNum : toLocaleNum(chapterNum, info.numList)}`;
    },
    getKJVChapterCount(bookKey: string) {
        // KJV, GEN
        const chapterCount = bibleObj.books[bookKey].chapterCount;
        return chapterCount;
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
    toBookKey(bible: string, book: string) {
        const info = getInfo(bible);
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
