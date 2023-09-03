import FileSource from '../helper/FileSource';
import {
    AnyObjectType, cloneJson, isValidJson,
} from '../helper/helpers';
import { ItemBase } from '../helper/ItemBase';
import {
    setSetting, getSetting,
} from '../helper/settingHelper';
import Bible from './Bible';
import DragInf from '../helper/DragInf';
import { handleError } from '../helper/errorHelpers';
import { log } from '../helper/loggerHelpers';
import {
    bibleRenderHelper,
} from '../helper/bible-helpers/bibleRenderHelpers';
import { DragTypeEnum } from '../helper/DragInf';
import { AddBiblePropsType } from '../helper/bible-helpers/bibleHelpers';

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
export default class BibleItem extends ItemBase
    implements DragInf<BibleItemType> {
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
        const bible = await Bible.readFileToData(this.fileSource ?? null);
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
        this.metadata = bibleItem.metadata ?? this.metadata;
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
        const title = await this.toTitle();
        const text = await this.toText();
        return { title, text };
    }
    async toTitle() {
        const bibleVerseKey = bibleRenderHelper
            .toBibleVersesKey(this.bibleKey, this.target);
        return await bibleRenderHelper.toTitle(bibleVerseKey)
            ?? `😟Unable to render title for ${bibleVerseKey}`;
    }
    async toText() {
        const bibleVerseKey = bibleRenderHelper
            .toBibleVersesKey(this.bibleKey, this.target);
        return await bibleRenderHelper.toText(bibleVerseKey) ||
            `😟Unable to render text for ${bibleVerseKey}`;
    }
    static itemToText(item: BibleItem) {
        return item.toText();
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
    static genBibleSearchData(bibleItem: BibleItem) {
        if (bibleItem.fileSource) {
            const json = bibleItem.toJson() as any;
            json.filePath = bibleItem.fileSource.filePath;
            return JSON.stringify(json);
        }
    }
    static parseBibleSearchData(data?: string) {
        if (!data) {
            return null;
        }
        const json = JSON.parse(data);
        const fileSource = FileSource.getInstance(json.filePath);
        return BibleItem.fromJson(json, fileSource);
    }
    static saveFromBibleSearch(props: AddBiblePropsType, data?: string) {
        // TODO: save to bible
        const oldBibleItem = this.parseBibleSearchData(data);
        console.log(props, oldBibleItem);
    }
}
