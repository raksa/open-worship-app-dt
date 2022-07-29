import SlideItem from './SlideItem';
import ItemSource from '../helper/ItemSource';
import FileSource from '../helper/FileSource';
import Slide from './Slide';
import { DisplayType } from '../helper/displayHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import {
    ChangeHistory,
    MAX_THUMBNAIL_SCALE,
    MIN_THUMBNAIL_SCALE,
    THUMBNAIL_SCALE_STEP,
} from './slideHelpers';
import slideEditingCacheManager from '../slide-editor/slideEditingCacheManager';
import { anyObjectType } from '../helper/helpers';
import Canvas from '../slide-editor/canvas/Canvas';

export type SlideType = {
    items: SlideItem[],
};

export default class SlideBase extends ItemSource<SlideType>{
    _history: {
        undo: ChangeHistory[];
        redo: ChangeHistory[];
    } = { undo: [], redo: [] };
    constructor(fileSource: FileSource, metadata: anyObjectType,
        content: SlideType) {
        super(fileSource, metadata, content);
        this.initHistory();
    }
    initHistory() {
        this._history = { undo: [], redo: [] };
    }
    loadEditingCache() {
        const data = slideEditingCacheManager.getData(this.fileSource);
        if (data !== null) {
            this._history = data.history;
            this.content = data.content;
        }
    }
    get copiedItem() {
        return this.items.find((item) => item.isCopied) || null;
    }
    set copiedItem(newItem: SlideItem | null) {
        this.items.forEach((item) => {
            item.isCopied = false;
        });
        if (newItem !== null) {
            newItem.isCopied = true;
        }
    }
    get selectedIndex() {
        const foundItem = this.items.find((item) => item.isSelected) || null;
        if (foundItem) {
            return this.items.indexOf(foundItem);
        }
        return -1;
    }
    set selectedIndex(newIndex: number) {
        this.items.forEach((item) => {
            item.isSelected = false;
        });
        if (this.items[newIndex]) {
            this.items[newIndex].isSelected = true;
        }
    }
    get items() {
        return this.content.items;
    }
    get newItems() {
        return this.items.map((item) => item.clone(true));
    }
    set items(newItems: SlideItem[]) {
        this.content.items = newItems;
    }
    getItemByIndex(index: number): SlideItem | null {
        return this.items[index] || null;
    }
    getItemById(id: number): SlideItem | null {
        return this.items.find((item) => item.id === id) || null;
    }
    async save(): Promise<boolean> {
        const isSuccess = await super.save();
        if (isSuccess) {
            slideEditingCacheManager.delete(this.fileSource);
        }
        return isSuccess;
    }
    async isModifying() {
        const slide = await Slide.readFileToDataNoCache(this.fileSource, true);
        if (slide) {
            for (let i = 0; i < this.items.length; i++) {
                if (await this.items[i].isEditing(i, slide)) {
                    return true;
                }
            }
            if (slide.content.items.length !== this.items.length) {
                return true;
            }
        }
        return false;
    }
    get undo() {
        return this._history.undo;
    }
    set undo(undo: ChangeHistory[]) {
        this._history.undo = undo;
    }
    get redo() {
        return this._history.redo;
    }
    set redo(redo: ChangeHistory[]) {
        this._history.redo = redo;
    }
    get maxItemId() {
        if (this.items.length) {
            const ids = this.items.map((item) => item.id);
            return Math.max.apply(Math, ids);
        }
        return 0;
    }
    setItemsWithHistory(newItems: SlideItem[]) {
        const currentNewItems = this.newItems;
        this.items = newItems;
        const newHistory: ChangeHistory = {
            items: [...currentNewItems],
        };
        this.undo = [...this.undo, newHistory];
        this.redo = [];
        slideEditingCacheManager.saveBySlideBase(this);
    }
    undoChanges() {
        const undo = [...this.undo];
        if (undo.length) {
            const lastDone = undo.pop() as ChangeHistory;
            this.undo = undo;
            const newItems = this.newItems;
            this.items = lastDone.items;
            this.redo = [...this.redo, {
                items: newItems,
            }];
        }
        slideEditingCacheManager.saveBySlideBase(this);
    }
    redoChanges() {
        const redo = [...this.redo];
        if (redo.length) {
            const lastRollback = redo.pop() as ChangeHistory;
            this.redo = redo;
            const newItems = this.newItems;
            this.items = lastRollback.items;
            this.undo = [...this.undo, {
                items: newItems,
            }];
        }
        slideEditingCacheManager.saveBySlideBase(this);
    }
    duplicateItem(slideItem: SlideItem) {
        const newItems = this.newItems;
        const newItem = slideItem.clone();
        if (newItem !== null) {
            newItem.id = this.maxItemId + 1;
            const index = this.items.indexOf(slideItem);
            newItems.splice(index + 1, 0, newItem);
            this.setItemsWithHistory(newItems);
        }
    }
    pasteItem() {
        if (this.copiedItem === null) {
            return;
        }
        const newItem = this.copiedItem.clone();
        if (newItem !== null) {
            newItem.id = this.maxItemId + 1;
            const newItems: SlideItem[] = [...this.items, newItem];
            this.setItemsWithHistory(newItems);
        }
    }
    moveItem(id: number, toIndex: number) {
        const fromIndex: number = this.items.findIndex((item) => item.id === id);
        const newItems = this.newItems;
        const target = newItems.splice(fromIndex, 1)[0];
        newItems.splice(toIndex, 0, target);
        this.setItemsWithHistory(newItems);
    }
    updateItem(slideItem: SlideItem) {
        const newItems = this.newItems.map((item) => {
            if (item.id === slideItem.id) {
                return slideItem;
            }
            return item;
        });
        this.setItemsWithHistory(newItems);
    }
    deleteItem(slideItem: SlideItem) {
        const newItems = this.items.filter((item) => {
            return item !== slideItem;
        });
        const result = SlideItem.getSelectedResult();
        if (result?.id === slideItem.id) {
            SlideItem.setSelectedItem(null);
        }
        this.setItemsWithHistory(newItems);
        this.fileSource.fireDeleteEvent();
    }
    addItem(slideItem: SlideItem) {
        const newItems = this.newItems;
        slideItem.id = this.maxItemId + 1;
        newItems.push(slideItem);
        this.setItemsWithHistory(newItems);
    }
    static toWrongDimensionString({ slide, display }: {
        slide: { width: number, height: number },
        display: { width: number, height: number },
    }) {
        return `⚠️ slide:${slide.width}x${slide.height} display:${display.width}x${display.height}`;
    }
    checkIsWrongDimension({ bounds }: DisplayType) {
        const found = this.items.map((item) => {
            return {
                width: item.width,
                height: item.height,
            };
        }).find(({ width, height }: { width: number, height: number }) => {
            return bounds.width !== width || bounds.height !== height;
        });
        if (found) {
            return {
                slide: found,
                display: { width: bounds.width, height: bounds.height },
            };
        }
        return null;
    }
    async fixSlideDimension({ bounds }: DisplayType) {
        this.items.forEach((item) => {
            item.width = bounds.width;
            item.height = bounds.height;
        });
        slideEditingCacheManager.saveBySlideBase(this);
    }
    showSlideItemContextMenu(e: any) {
        showAppContextMenu(e, [{
            title: 'New Slide Item', onClick: () => {
                const item = SlideItem.defaultSlideItemData(this.maxItemId + 1);
                const { width, height } = Canvas.getDefaultDim();
                this.addItem(new SlideItem(item.id, {
                    metadata: { width, height },
                    canvasItems: [], // TODO: add default canvas item
                }, this.fileSource));
            },
        }, {
            title: 'Paste', disabled: SlideItem.copiedItem === null,
            onClick: () => this.pasteItem(),
        }]);
    }
    static toScaleThumbSize(isUp: boolean, currentScale: number) {
        let newScale = currentScale + (isUp ? -1 : 1) * THUMBNAIL_SCALE_STEP;
        if (newScale < MIN_THUMBNAIL_SCALE) {
            newScale = MIN_THUMBNAIL_SCALE;
        }
        if (newScale > MAX_THUMBNAIL_SCALE) {
            newScale = MAX_THUMBNAIL_SCALE;
        }
        return newScale;
    }
    async rollBack() {
        this.initHistory();
        const slide = await Slide.readFileToDataNoCache(this.fileSource, true);
        if (slide) {
            this.content = slide.content;
        }
        slideEditingCacheManager.delete(this.fileSource);
        this.fileSource.fireUpdateEvent();
    }
}
