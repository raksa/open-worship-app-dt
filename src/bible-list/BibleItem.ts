import { useState, useEffect } from 'react';
import bibleHelper from '../bible-helper/bibleHelpers';
import { keyToBook, getVerses } from '../bible-helper/helpers1';
import { toLocaleNumber, toInputText } from '../bible-helper/helpers2';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { MetaDataType } from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { setSetting, getSetting } from '../helper/settingHelper';
import Bible from './Bible';

export type BibleTargetType = {
    book: string,
    chapter: number,
    startVerse: number,
    endVerse: number,
};
export default class BibleItem {
    id: string;
    bible: string;
    target: BibleTargetType;
    metadata?: MetaDataType;
    fileSource: FileSource | null;
    _isSelected: boolean = false;
    constructor(id: string, bible: string,
        target: BibleTargetType, metadata?: MetaDataType,
        fileSource?: FileSource) {
        this.id = id || '';
        this.bible = bible;
        this.target = target;
        this.metadata = metadata || {};
        this.fileSource = fileSource || null;
        BibleItem.getSelectedBibleItem().then((bibleItem) => {
            this.isSelected = bibleItem?.id === this.id;
        });
    }
    get isSelected() {
        return this._isSelected;
    }
    set isSelected(b: boolean) {
        if (this._isSelected === b) {
            return;
        }
        this._isSelected = b;
        if (this.isSelected) {
            BibleItem.setSelectedBibleItem(this);
            previewingEventListener.selectBibleItem(this);
        } else {
            previewingEventListener.selectBibleItem(null);
        }
        this.fileSource?.refresh();
    }
    update(bible: string, target: BibleTargetType,
        metadata?: MetaDataType) {
        this.bible = bible;
        this.target = target;
        this.metadata = metadata || this.metadata;
    }
    static clearBibleListEditingIndex() {
        setSetting('bible-item-editing', '');
    }
    static getBibleListEditingIndex() {
        const index = +getSetting('bible-item-editing', '-1');
        if (!isNaN(index) && ~index) {
            return index;
        }
        return null;
    }
    static genBibleItem(bible: string, target: BibleTargetType) {
        return new BibleItem('', bible, target);
    }
    clone() {
        return new BibleItem(this.id, this.bible, this.target,
            this.metadata, this.fileSource || undefined);
    }
    toJson() {
        return {
            id: this.id,
            bible: this.bible,
            target: this.target,
            metadata: this.metadata,
        };
    }
    static toBibleItemSetting(fileSource: FileSource | null, id: string | null) {
        if (fileSource === null || id === null) {
            return null;
        }
        return `${fileSource.filePath},${id}`;
    }
    static extractBibleItemSetting(bibleFilePathId: string) {
        const [bibleFilePath, id] = bibleFilePathId.split(',');
        return {
            fileSource: FileSource.genFileSource(bibleFilePath),
            id,
        };
    }
    static parseSelectedBibleItem(selected: string, fileSource: FileSource | null) {
        if (!selected || fileSource === null) {
            return null;
        }
        try {
            if (selected.includes(fileSource.filePath)) {
                const id = selected.split(',')[1];
                if (id) {
                    return id;
                }
            }
        } catch (error) {
            console.log(error);
        }
        return null;
    }
    static clearSelectedBibleItem() {
        setSetting('bible-item-selected', '');
    }
    static setSelectedBibleItem(bibleItem: BibleItem) {
        const selected = this.toBibleItemSetting(bibleItem.fileSource || null,
            bibleItem.id);
        if (selected !== null) {
            setSetting('bible-item-selected', selected);
        }
    }
    static async getSelectedBibleItem() {
        const fileSource = Bible.getSelectedBibleFileSource();
        const selected = getSetting('bible-item-selected', '');
        const id = this.parseSelectedBibleItem(selected, fileSource);
        if (id !== null) {
            const bible = await Bible.readFileToData(fileSource);
            if (bible) {
                return bible.content.items.find((item: any) => {
                    return item.id === id;
                }) || null;
            }
        }
        return null;
    }
    static convertPresent(bibleItem: BibleItem, oldBibleItems: BibleItem[]) {
        if (oldBibleItems.length < 2) {
            return [bibleItem];
        }
        return oldBibleItems.map((oldPresent) => {
            oldPresent.target = bibleItem.target;
            return oldPresent;
        });
    }
    static setBiblePresentingSetting(bibleItems: BibleItem[]) {
        setSetting('bible-present', JSON.stringify(bibleItems));
    }
    static getBiblePresentingSetting() {
        try {
            return JSON.parse(getSetting('bible-present')).map((item: any) => {
                return BibleItem.genBibleItem(item.bible, item.target);
            }) as BibleItem[];
        } catch (error) {
            console.log(error);
        }
        return [];
    }
    static async bibleItemToTitle(bibleItem: BibleItem) {
        const { bible, target } = bibleItem;
        const { book, chapter, startVerse, endVerse } = target;
        const chapterLocale = await toLocaleNumber(bible, chapter);
        const startVerseLocale = await toLocaleNumber(bible, startVerse);
        const endVerseLocale = await toLocaleNumber(bible, endVerse);
        const txtV = `${startVerseLocale}${startVerse !== endVerse ? ('-' + endVerseLocale) : ''}`;
        let bookKey = await keyToBook(bible, book);
        if (bookKey === null) {
            bookKey = bibleHelper.getKJVKeyValue()[book];
        }
        return `${bookKey} ${chapterLocale}:${txtV}`;
    }
    static async bibleItemToText(bibleItem: BibleItem) {
        const { bible, target } = bibleItem;
        let txt = '😟Unable to get bible text, check downloaded bible list in setting or refresh application!👌';
        if (target.chapter === null) {
            return txt;
        }
        const verses = await getVerses(bible, target.book, target.chapter);
        if (verses === null) {
            return txt;
        }
        txt = '';
        for (let i = target.startVerse; i <= target.endVerse; i++) {
            txt += ` (${await toLocaleNumber(bible, i)}): ${verses[i + '']}`;
        }
        return txt;
    }
}


export function usePresentRenderTitle(bibleItem: BibleItem) {
    const [title, setTitle] = useState<string>('');
    useEffect(() => {
        BibleItem.bibleItemToTitle(bibleItem).then(setTitle);
    }, [bibleItem]);
    return title;
}
export function usePresentRenderText(bibleItem: BibleItem) {
    const [text, setText] = useState<string>('');
    useEffect(() => {
        BibleItem.bibleItemToText(bibleItem).then(setText);
    }, [bibleItem]);
    return text;
}
export function usePresentToInputText(bible: string, book?: string | null,
    chapter?: number | null, startVerse?: number | null, endVerse?: number | null) {
    const [text, setText] = useState<string>('');
    useEffect(() => {
        toInputText(bible, book, chapter, startVerse, endVerse).then((text1) => {
            setText(text1);
        });
    }, [bible, book, chapter, startVerse, endVerse]);
    return text;
}