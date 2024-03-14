import {
    AnyObjectType, cloneJson, isValidJsonString,
} from '../helper/helpers';
import { ItemBase } from '../helper/ItemBase';
import {
    setSetting, getSetting,
} from '../helper/settingHelper';
import DragInf, { DragTypeEnum } from '../helper/DragInf';
import { handleError } from '../helper/errorHelpers';
import * as loggerHelpers from '../helper/loggerHelpers';
import {
    BibleTargetType, bibleRenderHelper,
} from './bibleRenderHelpers';
import ItemSource from '../helper/ItemSource';
import { BibleItemType } from './bibleItemHelpers';
import { copyToClipboard } from '../server/appHelper';

const BIBLE_PRESENT_SETTING_NAME = 'bible-present';

export default class BibleItem extends ItemBase
    implements DragInf<BibleItemType> {
    static readonly SELECT_SETTING_NAME = 'bible-item-selected';
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
    checkIsSameId(bibleItem: BibleItem) {
        return this.id === bibleItem.id;
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
                bookKey: '',
                chapter: 0,
                verseStart: 0,
                verseEnd: 0,
            },
            metadata: {},
        }, filePath);
        item.jsonError = json;
        return item;
    }
    static fromData(
        bibleKey: string, bookKey: string, chapter: number, verseStart: number,
        verseEnd: number
    ) {
        return BibleItem.fromJson({
            id: -1,
            bibleKey,
            target: {
                bookKey,
                chapter,
                verseStart,
                verseEnd,
            },
            metadata: {},
        });
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
            !json.target.bookKey ||
            typeof json.target.chapter !== 'number' ||
            typeof json.target.verseStart !== 'number' ||
            typeof json.target.verseEnd !== 'number') {
            loggerHelpers.error(json);
            throw new Error('Invalid bible item data');
        }
    }
    clone(isKeepId = false) {
        const bibleItem = BibleItem.fromJson(this.toJson());
        if (!isKeepId) {
            bibleItem.id = -1;
        }
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
        setSetting(BIBLE_PRESENT_SETTING_NAME, JSON.stringify(jsonData));
    }
    static getBiblePresentingSetting() {
        try {
            const str = getSetting(BIBLE_PRESENT_SETTING_NAME, '');
            if (isValidJsonString(str, true)) {
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
    toTitle() {
        return bibleRenderHelper.toTitle(this.bibleKey, this.target);
    }
    toText() {
        return bibleRenderHelper.toText(this.bibleKey, this.target);
    }
    toVerseTextList() {
        return bibleRenderHelper.toVerseTextList(this.bibleKey, this.target);
    }
    async copyTitleToClipboard() {
        const title = await this.toTitle();
        copyToClipboard(title);
    }
    async copyTextToClipboard() {
        const text = await this.toText();
        copyToClipboard(text);
    }
    async copyToClipboard() {
        const { title, text } = await this.toTitleText();
        copyToClipboard(`${title}\n${text}`);
    }
    syncData(bibleItem: BibleItem) {
        this._originalJson = bibleItem._originalJson;
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
        return oldBibleItem.save(bible);
    }
}
