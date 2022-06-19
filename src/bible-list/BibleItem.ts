import { useState, useEffect } from 'react';
import bibleHelper from '../bible-helper/bibleHelpers';
import { keyToBook, getVerses } from '../bible-helper/helpers1';
import { toLocaleNumber, toInputText } from '../bible-helper/helpers2';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { MetaDataType } from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { ItemBase } from '../helper/ItemBase';
import { setSetting, getSetting } from '../helper/settingHelper';
import Bible from './Bible';

export type BibleTargetType = {
    book: string,
    chapter: number,
    startVerse: number,
    endVerse: number,
};
export default class BibleItem extends ItemBase {
    static SELECT_SETTING_NAME = 'bible-item-selected';
    id: number;
    bibleName: string;
    target: BibleTargetType;
    metadata: MetaDataType;
    fileSource: FileSource | null;
    constructor(id: number | null, bibleName: string,
        target: BibleTargetType, metadata?: MetaDataType,
        fileSource?: FileSource) {
        super();
        this.id = id === null ? -1 : id;
        this.bibleName = bibleName;
        this.target = target;
        this.metadata = metadata || {};
        this.fileSource = fileSource || null;
    }
    static validate(item: any) {
        try {
            if (!item.bibleName ||
                typeof item.id !== 'number' ||
                !item.metadata || typeof item.metadata !== 'object' ||
                !item.target || typeof item.target !== 'object' ||
                !item.target.book ||
                typeof item.target.chapter !== 'number' ||
                typeof item.target.startVerse !== 'number' ||
                typeof item.target.endVerse !== 'number') {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
        return true;
    }
    get isSelected() {
        const selected = BibleItem.getSelected();
        return selected?.fileSource.filePath === this.fileSource?.filePath &&
            selected?.id === this.id;
    }
    set isSelected(b: boolean) {
        if (this.isSelected === b) {
            return;
        }
        if (this.isSelected) {
            previewingEventListener.selectItem(this);
        } else {
            previewingEventListener.selectItem(null);
        }
        this.fileSource?.refresh();
    }
    clone() {
        return new BibleItem(this.id, this.bibleName, this.target,
            this.metadata, this.fileSource || undefined);
    }
    toJson() {
        return {
            id: this.id,
            bibleName: this.bibleName,
            target: this.target,
            metadata: this.metadata,
        };
    }
    async save() {
        if (this.fileSource === null) {
            return false;
        }
        const bible = await Bible.readFileToData(this.fileSource);
        if (bible) {
            const bibleItem = bible.getItemById(this.id);
            if (bibleItem !== null) {
                bibleItem.update(this.bibleName, this.target, this.metadata);
                return bible.save();
            }
        }
        return false;
    }
    static async getSelectedItem() {
        const selected = this.getSelected();
        if (selected !== null) {
            const bible = await Bible.readFileToData(selected.fileSource);
            return bible?.getItemById(selected.id) || null;
        }
        return null;
    }
    update(bibleNam: string, target: BibleTargetType,
        metadata?: MetaDataType) {
        this.bibleName = bibleNam;
        this.target = target;
        this.metadata = metadata || this.metadata;
    }
    static genItem(bibleName: string, target: BibleTargetType) {
        return new BibleItem(null, bibleName, target);
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
            const str = getSetting('bible-present', '');
            if (!str) {
                return [];
            }
            return JSON.parse(str).map((item: any) => {
                return BibleItem.genItem(item.bibleName, item.target);
            }) as BibleItem[];
        } catch (error) {
            console.log(error);
        }
        return [];
    }
    static async itemToTitle(item: BibleItem) {
        const { bibleName: bible, target } = item;
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
    static async itemToText(item: BibleItem) {
        const { bibleName: bible, target } = item;
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


export function usePresentRenderTitle(item: BibleItem) {
    const [title, setTitle] = useState<string>('');
    useEffect(() => {
        BibleItem.itemToTitle(item).then(setTitle);
    }, [item]);
    return title;
}
export function usePresentRenderText(item: BibleItem) {
    const [text, setText] = useState<string>('');
    useEffect(() => {
        BibleItem.itemToText(item).then(setText);
    }, [item]);
    return text;
}
export function usePresentToInputText(bibleName: string, book?: string | null,
    chapter?: number | null, startVerse?: number | null, endVerse?: number | null) {
    const [text, setText] = useState<string>('');
    useEffect(() => {
        toInputText(bibleName, book, chapter, startVerse, endVerse).then((text1) => {
            setText(text1);
        });
    }, [bibleName, book, chapter, startVerse, endVerse]);
    return text;
}