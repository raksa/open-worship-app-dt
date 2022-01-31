import { BiblePresentType } from "../full-text-present/fullTextPresentHelper";

export type PlaylistType = {
    items: PlaylistItemType[]
};
export type PlaylistItemType = {
    type: 'slide' | 'bible',
    slideItemThumbPath?: string,
    bible?: BiblePresentType,
};
export const validateMeta = (meta: any) => {
    try {
        if (meta.fileVersion === 1 && meta.app === 'OpenWorship') {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}
export const validatePlaylistItem = (item: any) => {
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
export const validatePlaylist = (json: any) => {
    try {
        json.items = json.items || [];
        if (!(json.items as any[]).every((item) => validatePlaylistItem(item))) {
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
