import Bible from '../bible-list/Bible';
import { toastEventListener } from '../event/ToastEventListener';
import FileSource from '../helper/FileSource';
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
    static fromJson(json: any, fileSource: FileSource) {
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
    static fromJsonError(json: any, fileSource: FileSource) {
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
    static validate(json: any) {
        if (!['slide', 'bible', 'lyric'].includes(json.type)
            || json.path && typeof json.path !== 'string') {
            console.log(json);
            throw new Error('Invalid playlist item data');
        }
    }
    clone() {
        try {
            return PlaylistItem.fromJson(this.toJson(), this.fileSource);
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Cloning Playlist Item',
                message: error.message,
            });
        }
        return null;
    }
}
