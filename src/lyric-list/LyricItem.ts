import { ItemBase } from '../helper/ItemBase';
import { AnyObjectType, cloneJson } from '../helper/helpers';
import LyricEditingCacheManager from './LyricEditingCacheManager';
import DragInf, { DragTypeEnum } from '../helper/DragInf';
import { log } from '../helper/loggerHelpers';

export type LyricItemType = {
    id: number,
    title: string,
    content: string,
    metadata: AnyObjectType,
};

export default class LyricItem extends ItemBase
    implements DragInf<LyricItemType> {
    _originalJson: Readonly<LyricItemType>;
    static SELECT_SETTING_NAME = 'lyric-item-selected';
    id: number;
    filePath: string;
    isCopied: boolean;
    presentType: 'solo' | 'merge' = 'solo'; // TODO: implement this
    static copiedItem: LyricItem | null = null;
    editingCacheManager: LyricEditingCacheManager;
    static _cache = new Map<string, LyricItem>();
    constructor(id: number, filePath: string,
        json: LyricItemType,
        editingCacheManager?: LyricEditingCacheManager) {
        super();
        this.id = id;
        this._originalJson = Object.freeze(cloneJson(json));
        this.filePath = filePath;
        if (editingCacheManager !== undefined) {
            this.editingCacheManager = editingCacheManager;
        } else {
            this.editingCacheManager = new LyricEditingCacheManager(
                this.filePath, {
                items: [json],
                metadata: {},
            },
            );
            this.editingCacheManager.isUsingHistory = false;
        }
        this.isCopied = false;
        const key = LyricItem.genKeyByFileSource(filePath, id);
        LyricItem._cache.set(key, this);
    }
    get metadata() {
        const json = this.editingCacheManager.getLyricItemById(this.id);
        return json?.metadata || this._originalJson.metadata;
    }
    get lyricItemJson() {
        const items = this.editingCacheManager.presentJson.items;
        const lyricItemJson = items.find((item) => {
            return item.id === this.id;
        });
        return lyricItemJson || this._originalJson;
    }
    get title() {
        return this.lyricItemJson.title;
    }
    set title(title: string) {
        const items = this.editingCacheManager.presentJson.items;
        items.forEach((item) => {
            if (item.id === this.id) {
                item.title = title;
            }
        });
        this.editingCacheManager.pushLyricItems(items);
    }
    get content() {
        return this.lyricItemJson.content;
    }
    set content(content: string) {
        const items = this.editingCacheManager.presentJson.items;
        items.forEach((item) => {
            if (item.id === this.id) {
                item.content = content;
            }
        });
        this.editingCacheManager.pushLyricItems(items);
    }
    get isChanged() {
        return this.editingCacheManager.checkIsLyricItemChanged(this.id);
    }
    static fromJson(json: LyricItemType, filePath: string,
        editingCacheManager?: LyricEditingCacheManager) {
        this.validate(json);
        return new LyricItem(json.id, filePath, json,
            editingCacheManager);
    }
    static fromJsonError(
        json: AnyObjectType, filePath: string,
        editingCacheManager?: LyricEditingCacheManager,
    ) {
        const item = new LyricItem(-1, filePath, {
            id: -1,
            metadata: {},
            title: 'Error',
            content: 'Error',
        }, editingCacheManager);
        item.jsonError = json;
        return item;
    }
    toJson() {
        if (this.isError) {
            return this.jsonError;
        }
        return {
            id: this.id,
            title: this.title,
            content: this.content,
        };
    }
    static validate(json: AnyObjectType) {
        if (!json.title || !json.content) {
            log(json);
            throw new Error('Invalid lyric item data');
        }
    }
    clone(isDuplicateId?: boolean) {
        const lyricItem = LyricItem.fromJson(this.toJson(), this.filePath);
        if (!isDuplicateId) {
            lyricItem.id = -1;
        }
        return lyricItem;
    }
    static genKeyByFileSource(filePath: string, id: number) {
        return `${filePath}:${id}`;
    }
    static genDefaultLyric(name: string): LyricItemType {
        return {
            id: -1,
            title: name,
            content: 'Block1\n===\nBlock2\n===\nBlock3',
            metadata: {},
        };
    }
    static clearCache() {
        this._cache = new Map();
    }
    dragSerialize() {
        return {
            type: DragTypeEnum.LYRIC_ITEM,
            data: this.toJson(),
        };
    }
}
