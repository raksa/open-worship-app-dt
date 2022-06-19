import { ItemBase } from '../helper/ItemBase';

export type PlaylistItemType = 'slide' | 'bible' | 'lyric';
export default class PlaylistItem {
    type: PlaylistItemType;
    item: ItemBase;
    constructor(type: PlaylistItemType, item: ItemBase) {
        this.type = type;
        this.item = item;
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
    toJson() {
        return {
            type: this.type,
            path: this.item.toSelectedItemSetting(),
        };
    }
    static validate(item: any) {
        try {
            if (!['slide', 'bible', 'lyric'].includes(item.type)) {
                return false;
            }
            if (item.path && typeof item.path !== 'string') {
                return false;
            }
            return true;
        } catch (error) {
            console.log(error);
        }
        return false;
    }
}
