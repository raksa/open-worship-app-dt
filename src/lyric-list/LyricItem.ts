import { ItemBase } from '../helper/ItemBase';
import { AnyObjectType } from '../helper/helpers';
import DragInf, { DragTypeEnum } from '../helper/DragInf';
import * as loggerHelpers from '../helper/loggerHelpers';

export type LyricItemType = {
    id: number;
    title: string;
    content: string;
    metadata: AnyObjectType;
};

export default class LyricItem
    extends ItemBase
    implements DragInf<LyricItemType>
{
    static readonly SELECT_SETTING_NAME = 'lyric-item-selected';
    id: number;
    filePath: string;
    isCopied: boolean;
    showingType: 'solo' | 'merge' = 'solo'; // TODO: implement this
    // TODO: implement copying elements
    static readonly KEY_SEPARATOR = '<liid>';
    constructor(id: number, filePath: string, _json: LyricItemType) {
        super();
        this.id = id;
        this.filePath = filePath;
        this.isCopied = false;
    }
    get metadata() {
        return {};
    }
    get lyricItemJson() {
        return [];
    }
    get title() {
        return '';
    }
    set title(_title: string) {
        throw new Error('Not implemented');
    }
    get content() {
        throw new Error('Not implemented');
    }
    set content(_content: string) {
        throw new Error('Not implemented');
    }
    get isChanged() {
        return false;
    }
    static fromJson(json: LyricItemType, filePath: string) {
        this.validate(json);
        return new LyricItem(json.id, filePath, json);
    }
    static fromJsonError(json: AnyObjectType, filePath: string) {
        const item = new LyricItem(-1, filePath, {
            id: -1,
            metadata: {},
            title: 'Error',
            content: 'Error',
        });
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
