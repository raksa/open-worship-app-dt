import { ItemBase } from '../helper/ItemBase';
import { AnyObjectType, cloneJson } from '../helper/helpers';
import LyricEditorCacheManager from './LyricEditorCacheManager';
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
    private readonly _originalJson: Readonly<LyricItemType>;
    static readonly SELECT_SETTING_NAME = 'lyric-item-selected';
    id: number;
    filePath: string;
    isCopied: boolean;
    showingType: 'solo' | 'merge' = 'solo'; // TODO: implement this
    // TODO: implement copying elements
    editorCacheManager: LyricEditorCacheManager;
    static readonly KEY_SEPARATOR = '<liid>';
    constructor(
        id: number, filePath: string, json: LyricItemType,
        editorCacheManager?: LyricEditorCacheManager,
    ) {
        super();
        this.id = id;
        this._originalJson = Object.freeze(cloneJson(json));
        this.filePath = filePath;
        if (editorCacheManager !== undefined) {
            this.editorCacheManager = editorCacheManager;
        } else {
            this.editorCacheManager = new LyricEditorCacheManager(
                this.filePath, {
                items: [json],
                metadata: {},
            },
            );
            this.editorCacheManager.isUsingHistory = false;
        }
        this.isCopied = false;
    }
    get metadata() {
        const json = this.editorCacheManager.getLyricItemById(this.id);
        return json?.metadata || this._originalJson.metadata;
    }
    get lyricItemJson() {
        const items = this.editorCacheManager.presenterJson.items;
        const lyricItemJson = items.find((item) => {
            return item.id === this.id;
        });
        return lyricItemJson || this._originalJson;
    }
    get title() {
        return this.lyricItemJson.title;
    }
    set title(title: string) {
        const items = this.editorCacheManager.presenterJson.items;
        items.forEach((item) => {
            if (item.id === this.id) {
                item.title = title;
            }
        });
        this.editorCacheManager.pushLyricItems(items);
    }
    get content() {
        return this.lyricItemJson.content;
    }
    set content(content: string) {
        const items = this.editorCacheManager.presenterJson.items;
        items.forEach((item) => {
            if (item.id === this.id) {
                item.content = content;
            }
        });
        this.editorCacheManager.pushLyricItems(items);
    }
    get isChanged() {
        return this.editorCacheManager.checkIsLyricItemChanged(this.id);
    }
    static fromJson(
        json: LyricItemType, filePath: string,
        editorCacheManager?: LyricEditorCacheManager,
    ) {
        this.validate(json);
        return new LyricItem(json.id, filePath, json,
            editorCacheManager);
    }
    static fromJsonError(
        json: AnyObjectType, filePath: string,
        editorCacheManager?: LyricEditorCacheManager,
    ) {
        const item = new LyricItem(-1, filePath, {
            id: -1,
            metadata: {},
            title: 'Error',
            content: 'Error',
        }, editorCacheManager);
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
        return `${filePath}${this.KEY_SEPARATOR}${id}`;
    }
    static genDefaultLyric(name: string): LyricItemType {
        return {
            id: -1,
            title: name,
            content: 'Block1\n===\nBlock2\n===\nBlock3',
            metadata: {},
        };
    }
    dragSerialize() {
        return {
            type: DragTypeEnum.LYRIC_ITEM,
            data: this.toJson(),
        };
    }
}
