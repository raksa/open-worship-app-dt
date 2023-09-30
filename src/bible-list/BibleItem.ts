import {
    AnyObjectType, cloneJson, isValidJson,
} from '../helper/helpers';
import { ItemBase } from '../helper/ItemBase';
import {
    setSetting, getSetting,
} from '../helper/settingHelper';
import DragInf, { DragTypeEnum } from '../helper/DragInf';
import { handleError } from '../helper/errorHelpers';
import { log } from '../helper/loggerHelpers';
import {
    BibleTargetType, bibleRenderHelper,
} from './bibleRenderHelpers';
import ItemSource from '../helper/ItemSource';
import { BibleItemType } from './bibleItemHelpers';

export default class BibleItem extends ItemBase
    implements DragInf<BibleItemType> {
    static SELECT_SETTING_NAME = 'bible-item-selected';
    _originalJson: BibleItemType;
    id: number;
    filePath?: string;
    constructor(id: number, json: BibleItemType,
        filePath?: string) {
        super();
        this.id = id;
        this.filePath = filePath;
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
    static fromJson(json: BibleItemType, filePath?: string) {
        this.validate(json);
        return new BibleItem(json.id, json, filePath);
    }
    static fromJsonError(json: BibleItemType, filePath?: string) {
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
        }, filePath);
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
    async save(bible: ItemSource<any>) {
        if (this.filePath === null) {
            return false;
        }
        const bibleItem = bible.getItemById(this.id) as BibleItem | null;
        if (bibleItem !== null) {
            bibleItem.update(this);
            bible.setItemById(this.id, bibleItem);
            return bible.save();
        }
        return false;
    }
    update(bibleItem: BibleItem) {
        this.bibleKey = bibleItem.bibleKey;
        this.target = bibleItem.target;
        this.metadata = bibleItem.metadata;
    }
    static convertPresent(
        bibleItem: BibleItem, presentingBibleItems: BibleItem[],
    ) {
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
        const jsonData = bibleItems.map((bibleItem) => {
            return bibleItem.toJson();
        });
        setSetting('bible-present', JSON.stringify(jsonData));
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
            || `😟Unable to render title for ${bibleVerseKey}`;
    }
    async toText() {
        const bibleVerseKey = bibleRenderHelper
            .toBibleVersesKey(this.bibleKey, this.target);
        return await bibleRenderHelper.toText(bibleVerseKey) ||
            `😟Unable to render text for ${bibleVerseKey}`;
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
        if (bibleItem.filePath) {
            const json = bibleItem.toJson() as any;
            json.filePath = bibleItem.filePath;
            return JSON.stringify(json);
        }
    }
    static parseBibleSearchData(data?: string) {
        if (!data) {
            return null;
        }
        const json = JSON.parse(data);
        return BibleItem.fromJson(json, json.filePath);
    }
    static saveFromBibleSearch(
        bible: ItemSource<any>, oldBibleItem: BibleItem,
        newBibleItem: BibleItem,
    ) {
        oldBibleItem.bibleKey = newBibleItem.bibleKey;
        oldBibleItem.target = newBibleItem.target;
        oldBibleItem.save(bible);
    }
}
