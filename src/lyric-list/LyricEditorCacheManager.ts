import { AnyObjectType, cloneJson } from '../helper/helpers';
import EditorCacheManager from '../others/EditorCacheManager';
import { LyricEditorHistoryType, LyricType } from './Lyric';
import { LyricItemType } from './LyricItem';

export default class LyricEditorCacheManager
    extends EditorCacheManager<LyricEditorHistoryType, LyricType> {

    private originalJson: Readonly<LyricType>;

    constructor(filePath: string, json: LyricType) {
        super(filePath, 'lyric');
        this.originalJson = Object.freeze(cloneJson(json));
    }
    get cloneItems() {
        return cloneJson(this.originalJson.items);
    }
    get cloneMetadata() {
        return cloneJson(this.originalJson.metadata);
    }
    get presenterJson() {
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
        const latestHistory = this.presenterJson;
        return latestHistory.items.find((item) => {
            return item.id === id;
        }) || null;
    }
    checkIsLyricItemChanged(id: number) {
        const newItem = this.getLyricItemById(id);
        const lyricItems = this.originalJson.items;
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
        this.originalJson = Object.freeze(this.presenterJson);
        this.delete();
    }
}
