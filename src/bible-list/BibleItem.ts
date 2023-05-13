import { useState } from 'react';
import {
    keyToBook,
    getVerses,
} from '../helper/bible-helpers/bibleInfoHelpers';
import {
    toLocaleNumBB,
    toInputText,
} from '../helper/bible-helpers/serverBibleHelpers2';
import { openBibleSearch } from '../bible-search/HandleBibleSearch';
import { previewingEventListener } from '../event/PreviewingEventListener';
import FileSource from '../helper/FileSource';
import { AnyObjectType, cloneJson, isValidJson } from '../helper/helpers';
import { ItemBase } from '../helper/ItemBase';
import { setSetting, getSetting } from '../helper/settingHelper';
import Lyric from '../lyric-list/Lyric';
import Bible from './Bible';
import { getKJVKeyValue } from '../helper/bible-helpers/serverBibleHelpers';
import DragInf, { DragTypeEnum } from '../helper/DragInf';
import { handleError } from '../helper/errorHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { log } from '../helper/loggerHelpers';

export type BibleTargetType = {
    book: string,
    chapter: number,
    startVerse: number,
    endVerse: number,
};
export type BibleItemType = {
    id: number,
    bibleKey: string,
    target: BibleTargetType,
    metadata: AnyObjectType,
}
export default class BibleItem extends ItemBase implements DragInf<BibleItemType> {
    static SELECT_SETTING_NAME = 'bible-item-selected';
    _originalJson: BibleItemType;
    id: number;
    fileSource?: FileSource;
    constructor(id: number, json: BibleItemType,
        fileSource?: FileSource) {
        super();
        this.id = id;
        this.fileSource = fileSource;
        this._originalJson = cloneJson(json);
    }
    get bibleKey() {
        return this._originalJson.bibleKey;
    }
    set bibleKey(name: string) {
        this._originalJson.bibleKey = name;
    }
    get target() {
        return this._originalJson.target;
    }
    set target(target: BibleTargetType) {
        this._originalJson.target = target;
    }
    get metadata() {
        return this._originalJson.metadata;
    }
    set metadata(metadata: AnyObjectType) {
        this._originalJson.metadata = metadata;
    }
    get isSelected() {
        const selected = BibleItem.getSelectedResult();
        return selected?.fileSource.filePath === this.fileSource?.filePath &&
            selected?.id === this.id;
    }
    set isSelected(b: boolean) {
        if (this.isSelected === b) {
            return;
        }
        if (b) {
            previewingEventListener.selectBibleItem(this);
            BibleItem.setSelectedItem(this);
            Lyric.clearSelection();
            previewingEventListener.selectBibleItem(this);
        } else {
            BibleItem.setSelectedItem(null);
            previewingEventListener.selectBibleItem(null);
        }
        this.fileSource?.fireSelectEvent();
    }
    static async getSelectedItem() {
        const selected = this.getSelectedResult();
        if (selected !== null) {
            const bible = await Bible.readFileToData(selected.fileSource);
            return bible?.getItemById(selected.id);
        }
        return null;
    }
    get isSelectedEditing() {
        const selected = BibleItem.getSelectedEditingResult();
        return selected?.fileSource.filePath === this.fileSource?.filePath &&
            selected?.id === this.id;
    }
    set isSelectedEditing(b: boolean) {
        if (this.isSelectedEditing === b) {
            return;
        }
        if (b) {
            BibleItem.setSelectedEditingItem(this);
            openBibleSearch();
        } else {
            BibleItem.setSelectedEditingItem(null);
        }
        this.fileSource?.fireRefreshDirEvent();
    }
    static async getSelectedItemEditing() {
        const selected = this.getSelectedEditingResult();
        if (selected !== null) {
            const bible = await Bible.readFileToData(selected.fileSource);
            return bible?.getItemById(selected.id);
        }
        return null;
    }
    static fromJson(json: BibleItemType, fileSource?: FileSource) {
        this.validate(json);
        return new BibleItem(json.id, json, fileSource);
    }
    static fromJsonError(json: BibleItemType, fileSource?: FileSource) {
        const item = new BibleItem(-1, {
            id: -1,
            bibleKey: '',
            target: {
                book: '',
                chapter: 0,
                startVerse: 0,
                endVerse: 0,
            },
            metadata: {},
        }, fileSource);
        item.jsonError = json;
        return item;
    }
    toJson(): BibleItemType {
        if (this.isError) {
            return this.jsonError;
        }
        return {
            id: this.id,
            bibleKey: this.bibleKey,
            target: this.target,
            metadata: this.metadata,
        };
    }
    static validate(json: AnyObjectType) {
        if (!json.bibleKey ||
            typeof json.id !== 'number' ||
            (json.metadata && typeof json.metadata !== 'object') ||
            !json.target || typeof json.target !== 'object' ||
            !json.target.book ||
            typeof json.target.chapter !== 'number' ||
            typeof json.target.startVerse !== 'number' ||
            typeof json.target.endVerse !== 'number') {
            log(json);
            throw new Error('Invalid bible item data');
        }
    }
    clone() {
        const bibleItem = BibleItem.fromJson(this.toJson());
        bibleItem.id = -1;
        return bibleItem;
    }
    async save() {
        if (this.fileSource === null) {
            return false;
        }
        const bible = await Bible.readFileToData(this.fileSource || null);
        if (bible) {
            const bibleItem = bible.getItemById(this.id);
            if (bibleItem !== null) {
                bibleItem.update(this);
                bible.setItemById(this.id, bibleItem);
                return bible.save();
            }
        }
        return false;
    }
    update(bibleItem: BibleItem) {
        this.bibleKey = bibleItem.bibleKey;
        this.target = bibleItem.target;
        this.metadata = bibleItem.metadata || this.metadata;
    }
    static convertPresent(bibleItem: BibleItem, presentingBibleItems: BibleItem[]) {
        let list;
        if (presentingBibleItems.length < 2) {
            list = [bibleItem.clone()];
        } else {
            list = presentingBibleItems.map((presentingBibleItem) => {
                const newItem = bibleItem.clone();
                newItem.bibleKey = presentingBibleItem.bibleKey;
                return newItem;
            });
        }
        return list.filter((item) => item !== null);
    }
    static setBiblePresentingSetting(bibleItems: BibleItem[]) {
        setSetting('bible-present', JSON.stringify(bibleItems.map((bibleItem) => {
            return bibleItem.toJson();
        })));
    }
    static getBiblePresentingSetting() {
        try {
            const str = getSetting('bible-present', '');
            if (isValidJson(str, true)) {
                return JSON.parse(str).map((item: any) => {
                    return BibleItem.fromJson(item);
                }) as BibleItem[];
            }
        } catch (error) {
            handleError(error);
        }
        return [];
    }
    async toTitleText() {
        let title = '';
        try {
            title = await this.toTitle();
        } catch (error) {
            handleError(error);
            title = `😟Unable to render title for ${this.toKey()}`;
        }
        let text = '';
        try {
            text = await this.toText();
        } catch (error) {
            handleError(error);
            text = `😟Unable to render text for ${this.toKey()}`;
        }
        return { title, text };
    }
    toKey(isFull = false) {
        const { bibleKey: bible, target } = this;
        const { book, chapter, startVerse, endVerse } = target;
        const txtV = `${startVerse}${startVerse !== endVerse ? ('-' + endVerse) : ''}`;
        return `${isFull ? bible + ' | ' : ''}${book} ${chapter}:${txtV}`;
    }
    async toTitle() {
        const { bibleKey: bible, target } = this;
        const { book, chapter, startVerse, endVerse } = target;
        const chapterLocale = await toLocaleNumBB(bible, chapter);
        const startVerseLocale = await toLocaleNumBB(bible, startVerse);
        const endVerseLocale = await toLocaleNumBB(bible, endVerse);
        const txtV = `${startVerseLocale}${startVerse !== endVerse ? ('-' + endVerseLocale) : ''}`;
        let bookKey = await keyToBook(bible, book);
        if (bookKey === null) {
            bookKey = getKJVKeyValue()[book];
        }
        return `${bookKey} ${chapterLocale}:${txtV}`;
    }
    async toText() {
        const { bibleKey: bible, target } = this;
        let txt = '😟Unable to get bible text, check downloaded bible list '
            + 'in setting or refresh application!👌';
        if (target.chapter === null) {
            return txt;
        }
        const verses = await getVerses(bible, target.book, target.chapter);
        if (verses === null) {
            return txt;
        }
        txt = '';
        for (let i = target.startVerse; i <= target.endVerse; i++) {
            txt += ` (${await toLocaleNumBB(bible, i)}): ${verses[i.toString()]}`;
        }
        return txt;
    }
    static itemToText(item: BibleItem) {
        return item.toText();
    }
    static async clearSelection() {
        const bibleItem = await this.getSelectedItem();
        if (bibleItem) {
            bibleItem.isSelected = false;
        }
    }
    dragSerialize() {
        return {
            type: DragTypeEnum.BIBLE_ITEM,
            data: this.toJson(),
        };
    }
    static dragDeserialize(data: any) {
        try {
            return this.fromJson(data);
        } catch (error) {
            handleError(error);
        }
        return null;
    }
}

export function useBibleItemRenderTitle(item: BibleItem) {
    const [title, setTitle] = useState<string>('');
    useAppEffect(() => {
        item.toTitle().then(setTitle);
    }, [item]);
    return title;
}
export function useBibleItemRenderText(item: BibleItem) {
    const [text, setText] = useState<string>('');
    useAppEffect(() => {
        BibleItem.itemToText(item).then(setText);
    }, [item]);
    return text;
}
export function useBibleItemToInputText(bibleKey: string, book?: string | null,
    chapter?: number | null, startVerse?: number | null, endVerse?: number | null) {
    const [text, setText] = useState<string>('');
    useAppEffect(() => {
        toInputText(bibleKey, book, chapter, startVerse, endVerse).then((text1) => {
            setText(text1);
        });
    }, [bibleKey, book, chapter, startVerse, endVerse]);
    return text;
}
