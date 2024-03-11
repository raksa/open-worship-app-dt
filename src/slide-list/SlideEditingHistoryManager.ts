import { AnyObjectType, cloneJson } from '../helper/helpers';
import EditingHistoryManager from '../others/EditingHistoryManager';
import { SlideEditingHistoryType, SlideType } from './Slide';
import { SlideItemType } from './SlideItem';

export default class SlideEditingHistoryManager
    extends EditingHistoryManager<SlideEditingHistoryType, SlideType> {
    _originalJson: Readonly<SlideType>;
    constructor(filePath: string, json: SlideType) {
        super(filePath, 'slide');
        this._originalJson = Object.freeze(cloneJson(json));
    }
    get cloneItems() {
        return cloneJson(this._originalJson.items);
    }
    get cloneMetadata() {
        return cloneJson(this._originalJson.metadata);
    }
    get presentJson() {
        if (!this.isUsingHistory) {
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
    getSlideItemById(id: number) {
        const latestHistory = this.presentJson;
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
    save() {
        this._originalJson = Object.freeze(this.presentJson);
        this.delete();
    }
}
