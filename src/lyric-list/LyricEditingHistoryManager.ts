import { AnyObjectType, cloneJson } from '../helper/helpers';
import EditingHistoryManager from '../others/EditingHistoryManager';
import { LyricEditingHistoryType, LyricType } from './Lyric';
import { LyricItemType } from './LyricItem';

export default class LyricEditingHistoryManager
    extends EditingHistoryManager<LyricEditingHistoryType, LyricType> {
    _originalJson: Readonly<LyricType>;
    constructor(filePath: string, json: LyricType) {
        super(filePath, 'lyric');
        this._originalJson = Object.freeze(cloneJson(json));
    }
    get cloneItems() {
        return cloneJson(this._originalJson.items);
    }
    get cloneMetadata() {
        return cloneJson(this._originalJson.metadata);
    }
    get presentJson() {
        if (this.isUsingHistory) {
            return {
                items: this.cloneItems,
                metadata: this.cloneMetadata,
            };
        }
        const undoQueue = this.undoQueue;
        undoQueue.reverse();
        const newItems = undoQueue.find((history) => {
            return history.items !== undefined;
        })?.items;
        const newMetadata = undoQueue.find((history) => {
            return history.metadata !== undefined;
        })?.items;
        return {
            items: newItems || this.cloneItems,
            metadata: newMetadata || this.cloneMetadata,
        };
    }
    getLyricItemById(id: number) {
        const latestHistory = this.presentJson;
        return latestHistory.items.find((item) => {
            return item.id === id;
        }) || null;
    }
    checkIsLyricItemChanged(id: number) {
        const newItem = this.getLyricItemById(id);
        const lyricItems = this._originalJson.items;
        const originalItem = lyricItems.find((item) => {
            return item.id === id;
        });
        return newItem?.title !== originalItem?.title ||
            newItem?.content !== originalItem?.content;
    }
    pushLyricItems(items: LyricItemType[]) {
        const newHistory = {
            items,
        };
        this.pushUndo(newHistory);
    }
    pushMetadata(metadata: AnyObjectType) {
        const newHistory = {
            metadata,
        };
        this.pushUndo(newHistory);
    }
    save() {
        this._originalJson = Object.freeze(this.presentJson);
        this.delete();
    }
}
