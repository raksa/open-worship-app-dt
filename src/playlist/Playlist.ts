import { BibleItemType } from '../bible-list/Bible';
import {
    MetaDataType, MimetypeNameType,
} from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { validateMeta } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';

export type PlaylistItemType = {
    type: 'slide' | 'bible',
    slideItemPath?: string,
    bible?: BibleItemType,
}
export type PlaylistType = {
    items: PlaylistItemType[],
}
export default class Playlist extends ItemSource<PlaylistType>{
    static mimetype: MimetypeNameType = 'playlist';
    static validator: (json: Object) => boolean = validatePlaylist;
    static _instantiate(fileSource: FileSource, json: {
        metadata: MetaDataType, content: any,
    }) {
        return new Playlist(fileSource, json.metadata, json.content);
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        return ItemSource._readFileToDataNoCache<Playlist>(fileSource,
            validatePlaylist, this._instantiate);
    }
    static async readFileToData(fileSource: FileSource | null) {
        return ItemSource._readFileToData<Playlist>(fileSource,
            validatePlaylist, this._instantiate);
    }
}


export function validatePlaylistItem(item: any) {
    try {
        if ((item.type === 'slide' && (item.slideItemPath)) ||
            (item.type === 'bible' && (item.bible))
        ) {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function validatePlaylist(json: any) {
    try {
        if (!json.content || typeof json.content !== 'object'
            || !json.content.items || !(json.content.items instanceof Array)) {
            return false;
        }
        const content = json.content;
        if (!(content.items as any[]).every((item) => validatePlaylistItem(item))) {
            return false;
        }
        if (!validateMeta(json.metadata)) {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
    return true;
}
