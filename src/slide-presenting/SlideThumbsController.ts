import {
    getSlideDataByFilePath,
    SlideItemThumbType,
    validateSlide,
} from '../helper/slideHelper';
import { createFile, deleteFile, FileSourceType, overWriteFile, readFile } from '../helper/fileHelper';
import FileController from '../others/FileController';
import { toastEventListener } from '../event/ToastEventListener';
import { getSetting, getSlideItemSelectedSetting, setSetting } from '../helper/settingHelper';
import { cloneObject, parseSlideItemThumbSelected, toSlideItemThumbSelected } from '../helper/helpers';
import SlideListEventListener, { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';
import { showAppContextMenu } from '../others/AppContextMenu';
import { openItemSlideEdit } from '../editor/SlideItemEditorPopup';

export const DEFAULT_THUMB_SIZE = 250;
export const THUMB_SELECTED_SETTING_NAME = 'slide-item-thumb-selected';
export const THUMB_WIDTH_SETTING_NAME = 'presenting-item-thumb-size';
export type ChangeHistory = { items: SlideItemThumbType[] };

export default class SlideThumbsController extends FileController {
    _items: SlideItemThumbType[];
    _copiedIndex: number | null = null;
    _isWrongDimension = true;
    _selectedIndex: number | null = null;
    _isModifying = false;
    _eventListener: SlideListEventListener;
    _history: {
        undo: ChangeHistory[];
        redo: ChangeHistory[];
    } = { undo: [], redo: [] };
    constructor(fileSource: FileSourceType, eventListener: SlideListEventListener) {
        super(fileSource);
        this._eventListener = eventListener;
        const slidePresentData = getSlideDataByFilePath(this.filePath);
        if (slidePresentData === null) {
            const message = 'Unable to read slide data';
            toastEventListener.showSimpleToast({
                title: 'Initializaing Slide Data',
                message,
            });
            throw new Error(message);
        }
        this._items = slidePresentData.items;
        this._copiedIndex = null;
        this.selectedIndex = null;
        const slideItemThumbSelected = getSetting(THUMB_SELECTED_SETTING_NAME, '');
        const parsed = parseSlideItemThumbSelected(slideItemThumbSelected, this.filePath);
        if (parsed !== null && this.getItemByID(parsed.id)) {
            this.select(this._items.indexOf(this.getItemByID(parsed.id) as SlideItemThumbType));
        }
    }
    getItemByIndex(index: number): SlideItemThumbType | null {
        return this._items[index] || null;
    }
    getItemByID(id: string): SlideItemThumbType | null {
        return this._items.find((item) => item.id === id) || null;
    }
    get copiedIndex() {
        return this._copiedIndex;
    }
    get copiedItem() {
        if (this._copiedIndex === null) {
            return null;
        }
        return this.getItemByIndex(this._copiedIndex);
    }
    set copiedIndex(index: number | null) {
        this._copiedIndex = index;
    }
    get items() {
        return this._items;
    }
    get currentItems() {
        return [...this._items];
    }
    set items(newItems: SlideItemThumbType[]) {
        this._items = newItems;
        this._eventListener.refresh();
    }
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(selectedIndex: number | null) {
        this._selectedIndex = selectedIndex;
        this._eventListener.refresh();
    }
    get selectedItem() {
        if (this._selectedIndex === null) {
            return null;
        }
        return this.getItemByIndex(this._selectedIndex);
    }
    get isModifying() {
        return this._isModifying;
    }
    set isModifying(isModifying: boolean) {
        this._isModifying = isModifying;
        this._eventListener.refresh();
    }
    get isWrongDimension() {
        return this._isWrongDimension;
    }
    set isWrongDimension(isWrongDimension: boolean) {
        this._isWrongDimension = isWrongDimension;
        this._eventListener.refresh();
    }
    get undo() {
        return this._history.undo;
    }
    set undo(newUndo: ChangeHistory[]) {
        this._history.undo = newUndo;
        this._eventListener.refresh();
    }
    get redo() {
        return this._history.redo;
    }
    set redo(newRedo: ChangeHistory[]) {
        this._history.undo = newRedo;
        this._eventListener.refresh();
    }
    get maxId() {
        const list = this.items.map((item) => +item.id).sort();
        return (list[list.length - 1] || 0) + 1;
    }
    undoChanges() {
        const undo = [...this.undo];
        if (undo.length) {
            const lastDone = undo.pop() as ChangeHistory;
            this.undo = undo;
            const currentItems = this.currentItems;
            this.items = lastDone.items;
            this.redo = [...this.redo, {
                items: currentItems,
            }];
            this.isModifying = true;
        }
    }
    redoChanges() {
        const redo = [...this.redo];
        if (redo.length) {
            const lastRollback = redo.pop() as ChangeHistory;
            this.redo = redo;
            const currentItems = this.currentItems;
            this.items = lastRollback.items;
            this.undo = [...this.undo, {
                items: currentItems,
            }];
            this.isModifying = true;
        }
    }
    fixSlideDimension() {
        toastEventListener.showSimpleToast({
            title: 'Fix Slide Dimension',
            message: 'Slide dimension has been fixed',
        });
        this.isWrongDimension = false;
    }
    save() {
        try {
            const filePath = getSlideItemSelectedSetting();
            if (filePath !== null) {
                const slideData = getSlideDataByFilePath(filePath);
                if (slideData !== null) {
                    slideData.items = this.currentItems;
                    if (overWriteFile(filePath, JSON.stringify(slideData))) {
                        toastEventListener.showSimpleToast({
                            title: 'Saving Slide',
                            message: 'Slide has been saved',
                        });
                        this.isModifying = false;
                        return true;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
        toastEventListener.showSimpleToast({
            title: 'Saving Slide',
            message: 'Unable to save slide!',
        });
        return false;
    }
    select(index: number | null) {
        this.selectedIndex = index;
        if (index === null) {
            setSetting(THUMB_SELECTED_SETTING_NAME, '');
            if (isWindowEditingMode()) {
                slideListEventListenerGlobal.selectSlideItemThumb(null);
            }
            return;
        }
        const id = this.selectedItem?.id as string;
        const selected = toSlideItemThumbSelected(this.filePath, id);
        setSetting(THUMB_SELECTED_SETTING_NAME, selected || '');
        slideListEventListenerGlobal.selectSlideItemThumb((this.selectedItem as SlideItemThumbType));
    }
    duplicate(index: number) {
        const newItems = this.currentItems;
        const newItem: SlideItemThumbType = cloneObject(newItems[index]);
        newItem.id = `${this.maxId + 1}`;
        newItems.splice(index + 1, 0, newItem);
        this.setItemsWithHistory(newItems);
    }
    paste() {
        if (this.copiedItem !== null) {
            const newItem: SlideItemThumbType = cloneObject(this.copiedItem);
            newItem.id = `${this.maxId + 1}`;
            const newItems: SlideItemThumbType[] = [...this.items, newItem];
            this.setItemsWithHistory(newItems);
        }
    }
    deleteItem(index: number) {
        if (index === this._selectedIndex) {
            this.select(null);
        }
        const newItems = this.items.filter((_, i) => i !== index);
        this.setItemsWithHistory(newItems);
    }
    setItemsWithHistory(newItems: SlideItemThumbType[]) {
        this.isModifying = true;
        const currentItems = this.currentItems;
        this.items = newItems;
        this.undo = [...this.undo, {
            items: [...currentItems],
        }];
        this.redo = [];
    }
    move(id: string, toIndex: number) {
        const fromIndex: number = this.items.findIndex((item) => item.id === id);
        const currentItems = this.currentItems;
        const target = currentItems.splice(fromIndex, 1)[0];
        currentItems.splice(toIndex, 0, target);
        this.items = currentItems;
        slideListEventListenerGlobal.ordering();
    }
    showSlideItemContextMenu(e: any) {
        showAppContextMenu(e, [{
            title: 'Paste', disabled: this.copiedIndex === null,
            onClick: () => this.paste(),
        }]);
    };
    showItemThumbnailContextMenu(e: any, index: number) {
        showAppContextMenu(e, [
            {
                title: 'Copy', onClick: () => {
                    this.copiedIndex = index;
                },
            },
            {
                title: 'Duplicate', onClick: () => {
                    this.duplicate(index);
                },
            },
            {
                title: 'Edit', onClick: () => {
                    const isEditing = isWindowEditingMode();
                    const item = this.getItemByIndex(index);
                    if (item !== null) {
                        if (isEditing) {
                            this.select(index);
                            slideListEventListenerGlobal.selectSlideItemThumb(item);
                        } else {
                            openItemSlideEdit(item);
                        }
                    }
                },
            },
            {
                title: 'Delete', onClick: () => {
                    this.deleteItem(index);
                },
            },
        ]);
    }
}
