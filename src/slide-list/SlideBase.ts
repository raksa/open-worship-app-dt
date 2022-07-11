import SlideItem from './SlideItem';
import { MetaDataType } from '../helper/fileHelper';
import ItemSource from '../helper/ItemSource';
import FileSource from '../helper/FileSource';
import { ChangeHistory } from './slideHelpers';
import Slide from './Slide';

export type SlideType = {
    items: SlideItem[],
};

export default class SlideBase extends ItemSource<SlideType>{
    _history: {
        undo: ChangeHistory[];
        redo: ChangeHistory[];
    };
    constructor(fileSource: FileSource, metadata: MetaDataType,
        content: SlideType) {
        super(fileSource, metadata, content);
        this._history = { undo: [], redo: [] };
    }
    getItemByIndex(index: number): SlideItem | null {
        return this.items[index] || null;
    }
    getItemById(id: number): SlideItem | null {
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
        return [...this.items];
    }
    set items(newItems: SlideItem[]) {
        this.content.items = newItems;
        this.save();
    }
    async isModifying() {
        const slide = await Slide.readFileToDataNoCache(this.fileSource);
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
        this.save();
    }
    get redo() {
        return this._history.redo;
    }
    set redo(redo: ChangeHistory[]) {
        this._history.redo = redo;
        this.save();
    }
    get maxId() {
        // TODO: leverage Slide instead
        if (this.items.length) {
            return Math.max.apply(Math, this.items.map((item) => item.id));
        }
        return 0;
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
        if (newItem !== null) {
            newItem.id = this.maxId + 1;
            newItems.splice(index + 1, 0, newItem);
            this.setItemsWithHistory(newItems);
        }
    }
    paste() {
        if (this.copiedItem === null) {
            return;
        }
        const newItem = this.copiedItem.clone();
        if (newItem !== null) {
            newItem.id = this.maxId + 1;
            const newItems: SlideItem[] = [...this.items, newItem];
            this.setItemsWithHistory(newItems);
        }
    }
    move(id: number, toIndex: number) {
        const fromIndex: number = this.items.findIndex((item) => item.id === id);
        const currentItems = this.newItems;
        const target = currentItems.splice(fromIndex, 1)[0];
        currentItems.splice(toIndex, 0, target);
        this.setItemsWithHistory(currentItems);
    }
    delete(index: number) {
        const newItems = this.items.filter((_, i) => i !== index);
        this.setItemsWithHistory(newItems);
        this.save();
    }
    add(newItem: SlideItem) {
        const newItems = this.newItems;
        newItem.id = this.maxId + 1;
        newItems.push(newItem);
        this.setItemsWithHistory(newItems);
    }
}
