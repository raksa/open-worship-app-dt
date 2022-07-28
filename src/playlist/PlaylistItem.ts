import Bible from '../bible-list/Bible';
import FileSource from '../helper/FileSource';
import { anyObjectType, cloneObject } from '../helper/helpers';
import { ItemBase } from '../helper/ItemBase';
import { ItemSourceAnyType } from '../helper/ItemSource';
import Lyric from '../lyric-list/Lyric';
import Slide from '../slide-list/Slide';

export type PlaylistItemType = 'slide' | 'bible' | 'lyric';
export default class PlaylistItem {
    type: PlaylistItemType;
    item: ItemSourceAnyType | ItemBase;
    fileSource: FileSource;
    jsonError: any;
    constructor(type: PlaylistItemType, item: ItemSourceAnyType | ItemBase,
        fileSource: FileSource) {
        this.type = type;
        this.item = item;
        this.fileSource = fileSource;
    }
    get isError() {
        return !!this.jsonError;
    }
    get path() {
        if (!this.item.fileSource) {
            return null;
        }
        return this.item.fileSource.filePath;
    }
    get isSlideItem() {
        return this.type === 'slide';
    }
    get isBibleItem() {
        return this.type === 'bible';
    }
    get isLyricItem() {
        return this.type === 'lyric';
    }
    static fromJson(json: anyObjectType, fileSource: FileSource) {
        this.validate(json);
        const itemFS = FileSource.genFileSource(json.path);
        let item;
        if (json.type === 'slide') {
            item = Slide.readFileToData(itemFS);
        } else if (json.type === 'bible') {
            item = Bible.readFileToData(itemFS);
        } else {
            item = Lyric.readFileToData(itemFS);
        }
        if (!item) {
            throw new Error('Fail to instantiate item');
        }
        return new PlaylistItem(json.type, item as any, fileSource);
    }
    static fromJsonError(json: anyObjectType, fileSource: FileSource) {
        const item = new PlaylistItem('' as any, {} as any, fileSource);
        item.jsonError = json;
        return item;
    }
    toJson() {
        if (this.isError) {
            return this.jsonError;
        }
        const json = {
            type: this.type,
            path: this.path,
        };
        PlaylistItem.validate(json);
        return json;
    }
    static validate(json: anyObjectType) {
        if (!['slide', 'bible', 'lyric'].includes(json.type)
            || json.path && typeof json.path !== 'string') {
            console.log(json);
            throw new Error('Invalid playlist item data');
        }
    }
    clone() {
        return cloneObject(this);
    }
}
