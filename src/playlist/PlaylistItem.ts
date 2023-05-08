import Bible from '../bible-list/Bible';
import FileSource from '../helper/FileSource';
import { AnyObjectType, cloneJson } from '../helper/helpers';
import { log } from '../helper/loggerHelpers';
import Lyric from '../lyric-list/Lyric';
import Slide from '../slide-list/Slide';

const itemTypeList = ['error', 'slide', 'bible-item', 'lyric'] as const;
type ItemType = typeof itemTypeList[number];
export type PlaylistItemType = {
    type: ItemType;
    filePath: string,
    id?: number,
}

export default class PlaylistItem {
    _originalJson: Readonly<PlaylistItemType>;
    fileSource: FileSource;
    jsonError: any;
    constructor(fileSource: FileSource, json: PlaylistItemType) {
        this.fileSource = fileSource;
        this._originalJson = Object.freeze(cloneJson(json));
    }
    get isError() {
        return this.type === 'error';
    }
    get type() {
        return this._originalJson.type;
    }
    get isSlide() {
        return this.type === 'slide';
    }
    async getSlide() {
        if (!this.isSlide) {
            return null;
        }
        return Slide.readFileToData(this.fileSource);
    }
    get isBibleItem() {
        return this.type === 'bible-item';
    }
    async getBibleItem() {
        if (this.isBibleItem) {
            const bible = await Bible.readFileToData(this.fileSource);
            if (bible) {
                return bible.getItemById(this._originalJson.id as number);
            }
        }
        return null;
    }
    get isLyric() {
        return this.type === 'lyric';
    }
    async getLyric() {
        if (!this.isLyric) {
            return null;
        }
        return Lyric.readFileToData(this.fileSource);
    }
    static fromJson(fileSource: FileSource, json: PlaylistItemType) {
        this.validate(json);
        return new PlaylistItem(fileSource, json);
    }
    static fromJsonError(fileSource: FileSource, json: AnyObjectType) {
        const item = new PlaylistItem(fileSource, {
            type: 'error',
            filePath: '',
        });
        item.jsonError = json;
        return item;
    }
    toJson(): PlaylistItemType {
        if (this.isError) {
            return this.jsonError;
        }
        return {
            type: this.type,
            filePath: this._originalJson.filePath,
            id: this._originalJson.id,
        };
    }
    static validate(json: AnyObjectType) {
        if (!itemTypeList.includes(json.type)
            || json.path && typeof json.path !== 'string'
            || (json.type === 'bible-item' && typeof json.id !== 'number')
        ) {
            log(json);
            throw new Error('Invalid playlist item data');
        }
    }
    clone() {
        return PlaylistItem.fromJson(this.fileSource, this.toJson());
    }
}
