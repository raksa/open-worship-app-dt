import {
    BiblePresentType,
} from '../full-text-present/fullTextPresentHelper';
import { MimetypeNameType } from './fileHelper';
import { validateMeta } from './helpers';
import ItemSource from './ItemSource';

export type PlaylistItemType = {
    type: 'slide' | 'bible',
    slideItemThumbPath?: string,
    bible?: BiblePresentType,
}
export type PlaylistType = {
    items: PlaylistItemType[],
}
export class Playlist extends ItemSource<PlaylistType>{
    static mimetype: MimetypeNameType = 'playlist';
    static validator: (json: Object) => boolean = validatePlaylist;
}


export function validatePlaylistItem(item: any) {
    try {
        if ((item.type === 'slide' && (item.slideItemThumbPath)) ||
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
