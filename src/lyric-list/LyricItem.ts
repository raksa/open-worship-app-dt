import { ItemBase } from '../helper/ItemBase';
import { AnyObjectType, cloneJson } from '../helper/helpers';
import LyricEditingHistoryManager from './Lyr';
import DragInf, { DragTypeEnum } from '../helper/DragInf';
import * as loggerHelpers from '../helper/loggerHelpers';

export type LyricItemType = {
    id: number,
    title: string,
    content: string,
    metadata: AnyObjectType,
};

export default class LyricItem extends ItemBase
    implements DragInf<LyricItemType> {
    _originalJson: Readonly<LyricItemType>;
    static readonly SELECT_SETTING_NAME = 'lyric-item-selected';
    id: number;
    filePath: string;
    isCopied: boolean;
    presentType: 'solo' | 'merge' = 'solo'; // TODO: implement this
    static copiedItem: LyricItem | null = null;
    editingHistoryManager: LyricEditingHistoryManager;
    private static _cache = new Map<string, LyricItem>();
    constructor(id: number, filePath: string,
        json: LyricItemType,
        editingHistoryManager?: LyricEditingHistoryManager) {
        super();
        this.id = id;
        this._originalJson = Object.freeze(cloneJson(json));
        this.filePath = filePath;
        if (editingHistoryManager !== undefined) {
            this.editingHistoryManager = editingHistoryManager;
        } else {
            this.editingHistoryManager = new LyricEditingHistoryManager(
                this.filePath, {
                items: [json],
                metadata: {},
            },
            );
            this.editingHistoryManager.isUsingHistory = false;
        }
        this.isCopied = false;
        const key = LyricItem.genKeyByFileSource(filePath, id);
        LyricItem._cache.set(key, this);
    }
    get metadata() {
        const json = this.editingHistoryManager.getLyricItemById(this.id);
        return json?.metadata || this._originalJson.metadata;
    }
    get lyricItemJson() {
        const items = this.editingHistoryManager.presentJson.items;
        const lyricItemJson = items.find((item) => {
            return item.id === this.id;
        });
        return lyricItemJson || this._originalJson;
    }
    get title() {
        return this.lyricItemJson.title;
    }
    set title(title: string) {
        const items = this.editingHistoryManager.presentJson.items;
        items.forEach((item) => {
            if (item.id === this.id) {
                item.title = title;
            }
        });
        this.editingHistoryManager.pushLyricItems(items);
    }
    get content() {
        return this.lyricItemJson.content;
    }
    set content(content: string) {
        const items = this.editingHistoryManager.presentJson.items;
        items.forEach((item) => {
            if (item.id === this.id) {
                item.content = content;
            }
        });
        this.editingHistoryManager.pushLyricItems(items);
    }
    get isChanged() {
        return this.editingHistoryManager.checkIsLyricItemChanged(this.id);
    }
    static fromJson(json: LyricItemType, filePath: string,
        editingHistoryManager?: LyricEditingHistoryManager) {
        this.validate(json);
        return new LyricItem(json.id, filePath, json,
            editingHistoryManager);
    }
    static fromJsonError(
        json: AnyObjectType, filePath: string,
        editingHistoryManager?: LyricEditingHistoryManager,
    ) {
        const item = new LyricItem(-1, filePath, {
            id: -1,
            metadata: {},
            title: 'Error',
            content: 'Error',
        }, editingHistoryManager);
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
            loggerHelpers.error(json);
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
