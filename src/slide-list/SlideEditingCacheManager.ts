import FileSource from '../helper/FileSource';
import { AnyObjectType } from '../helper/helpers';
import EditingCacheManager from '../others/EditingCacheManager';
import { SlideEditingHistoryType, SlideType } from './SlideBase';
import { SlideItemType } from './SlideItem';

export default class SlideEditingCacheManager
    extends EditingCacheManager<SlideEditingHistoryType, SlideType> {
    _originalJson: Readonly<SlideType>;
    constructor(fileSource: FileSource, json: SlideType) {
        super(fileSource, 'slide');
        this._originalJson = json;
    }
    get latestHistory() {
        if (!this.isUsingHistory) {
            return {
                items: this._originalJson.items,
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
            items: newItems || this._originalJson.items,
            metadata: newMetadata || this._originalJson.metadata,
        };
    }
    getSlideItemById(id: number) {
        const latestHistory = this.latestHistory;
        return latestHistory.items.find((item) => {
            return item.id === id;
        }) || null;
    }
    checkIsSlideItemChanged(id: number) {
        const newItem = this.getSlideItemById(id);
        const slideItems = this._originalJson.items;
        const originalItem = slideItems.find((item) => {
            return item.id === id;
        });
        return JSON.stringify(newItem) !== JSON.stringify(originalItem);
    }
    pushSlideItems(items: SlideItemType[]) {
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
