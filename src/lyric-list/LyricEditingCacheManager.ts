import FileSource from '../helper/FileSource';
import { AnyObjectType } from '../helper/helpers';
import EditingCacheManager from '../others/EditingCacheManager';
import { LyricEditingHistoryType, LyricType } from './Lyric';
import { LyricItemType } from './LyricItem';

export default class LyricEditingCacheManager
    extends EditingCacheManager<LyricEditingHistoryType> {
    _originalJson: Readonly<LyricType>;
    constructor(fileSource: FileSource, json: LyricType) {
        super(fileSource, 'lyric');
        this._originalJson = json;
    }
    get latestHistory() {
        if (!this.isUsingHistory) {
            return {
                lyricItems: this._originalJson.items,
                metadata: this._originalJson.metadata,
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
            lyricItems: newItems || this._originalJson.items,
            metadata: newMetadata || this._originalJson.metadata,
        };
    }
    getLyricItemById(id: number) {
        const latestHistory = this.latestHistory;
        return latestHistory.lyricItems.find((item) => {
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
}
