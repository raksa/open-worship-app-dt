import SlideItem from './SlideItem';
import Slide from '../slide-list/Slide';

export const MIN_THUMB_SCALE = 1;
export const THUMB_SCALE_STEP = 0.2;
export const MAX_THUMB_SCALE = 3;
export const DEFAULT_THUMB_SIZE = 250;
export const THUMB_SELECTED_SETTING_NAME = 'slide-item-thumb-selected';
export const THUMB_WIDTH_SETTING_NAME = 'presenting-item-thumb-size';
export type ChangeHistory = { items: SlideItem[] };

export default class SlideItemsControllerBase {
    slide: Slide;
    _history: {
        undo: ChangeHistory[];
        redo: ChangeHistory[];
    } = { undo: [], redo: [] };
    constructor(slide: Slide) {
        this.slide = slide;
        this._history = { undo: [], redo: [] };
    }
    getItemByIndex(index: number): SlideItem | null {
        return this.items[index] || null;
    }
    getItemById(id: string): SlideItem | null {
        return this.items.find((item) => item.id === id) || null;
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
    get selectedItem() {
        return this.items.find((item) => item.isSelected) || null;
    }
    set selectedItem(newItem: SlideItem | null) {
        this.items.forEach((item) => {
            item.isSelected = false;
        });
        if (newItem !== null) {
            newItem.isSelected = true;
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
        return this.slide.content.items;
    }
    get newItems() {
        return [...this.items];
    }
    set items(newItems: SlideItem[]) {
        newItems.forEach((item, i) => {
            item.index = i;
        });
        this.slide.content.items = newItems;
        this.slide.fileSource.refresh();
    }
    async isModifying() {
        const slide = await Slide.readFileToDataNoCache(this.slide.fileSource);
        if (slide) {
            for (const item of this.items) {
                if (await item.isEditing(slide)) {
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
        this.slide.fileSource.refresh();
    }
    get redo() {
        return this._history.redo;
    }
    set redo(redo: ChangeHistory[]) {
        this._history.redo = redo;
        this.slide.fileSource.refresh();
    }
    get maxId() {
        return Math.max.apply(Math, this.items.map((item) => +item.id));
    }
    setItemsWithHistory(newItems: SlideItem[]) {
        const currentItems = this.newItems;
        this.items = newItems;
        this.undo = [...this.undo, {
            items: [...currentItems],
        }];
        this.redo = [];
    }
    undoChanges() {
        const undo = [...this.undo];
        if (undo.length) {
            const lastDone = undo.pop() as ChangeHistory;
            this.undo = undo;
            const currentItems = this.newItems;
            this.items = lastDone.items;
            this.redo = [...this.redo, {
                items: currentItems,
            }];
        }
    }
    redoChanges() {
        const redo = [...this.redo];
        if (redo.length) {
            const lastRollback = redo.pop() as ChangeHistory;
            this.redo = redo;
            const currentItems = this.newItems;
            this.items = lastRollback.items;
            this.undo = [...this.undo, {
                items: currentItems,
            }];
        }
    }
    duplicate(index: number) {
        const newItems = this.newItems;
        const newItem = newItems[index].clone();
        newItem.id = `${this.maxId + 1}`;
        newItems.splice(index + 1, 0, newItem);
        this.setItemsWithHistory(newItems);
    }
    paste() {
        if (this.copiedItem === null) {
            return;
        }
        const newItem = this.copiedItem.clone();
        newItem.id = `${this.maxId + 1}`;
        const newItems: SlideItem[] = [...this.items, newItem];
        this.setItemsWithHistory(newItems);
    }
    move(id: string, toIndex: number) {
        const fromIndex: number = this.items.findIndex((item) => item.id === id);
        const currentItems = this.newItems;
        const target = currentItems.splice(fromIndex, 1)[0];
        currentItems.splice(toIndex, 0, target);
        this.setItemsWithHistory(currentItems);
    }
    delete(index: number) {
        const newItems = this.items.filter((_, i) => i !== index);
        this.setItemsWithHistory(newItems);
        this.slide.fileSource.refresh();
    }
    add(newItem: SlideItem) {
        const newItems = this.newItems;
        newItem.id = `${this.maxId + 1}`;
        newItems.push(newItem);
        this.setItemsWithHistory(newItems);
    }
    async save() {
        if (await this.slide.save()) {
            const fileSource = this.slide.fileSource;
            const slide = await Slide.readFileToData(fileSource, true);
            if (slide) {
                this.slide = slide;
                fileSource.refresh();
            }
        }
    }
}
