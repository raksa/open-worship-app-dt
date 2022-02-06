import {
    getSlideDataByFilePath,
    SlideItemThumbType,
    validateSlide,
} from '../helper/slideHelper';
import { createFile, deleteFile, FileSourceType, readFile } from '../helper/fileHelper';
import FileController from '../others/FileController';
import { toastEventListener } from '../event/ToastEventListener';
import { getSetting, getSlideItemSelectedSetting, setSetting } from '../helper/settingHelper';
import { cloneObject, parseSlideItemThumbSelected, toSlideItemThumbSelected } from '../helper/helpers';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';

export const THUMB_SELECTED_SETTING_NAME = 'slide-item-thumb-selected';
export type ChangeHistory = { items: SlideItemThumbType[] };

export default class SlideThumbsController extends FileController {
    _items: SlideItemThumbType[];
    _thumbControllers: ThumbController[] = [];
    _copiedIndex: number | null = null;
    _thumbWidth = 250;
    _isWrongDimension = true;
    _selectedIndex: number | null = null;
    _isModifying = false;
    _history: {
        undo: ChangeHistory[];
        redo: ChangeHistory[];
    } = { undo: [], redo: [] };
    constructor(fileSource: FileSourceType) {
        super(fileSource);
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
        this.reloadThumbControllers();
    }
    reloadThumbControllers() {
        this._copiedIndex = null;
        this._selectedIndex = null;
        this._thumbControllers = [];
        this._items.forEach((thumbItem) => {
            this._thumbControllers.push(new ThumbController(thumbItem));
        });
        const slideItemThumbSelected = getSetting(THUMB_SELECTED_SETTING_NAME, '');
        const parsed = parseSlideItemThumbSelected(slideItemThumbSelected, this.filePath);
        if (parsed !== null) {
            const thumbController = this.getThumbControllerByID(parsed.id);
            if (thumbController !== null) {
                this.select(this._thumbControllers.indexOf(thumbController));
            }
        }
    }
    getThumbControllerByIndex(index: number): ThumbController | null {
        return this._thumbControllers[index] || null;
    }
    getThumbControllerByID(id: string): ThumbController | null {
        return this._thumbControllers.find((thumbController) => {
            return thumbController.id === id;
        }) || null;
    }
    get copiedIndex() {
        return this._copiedIndex;
    }
    get copiedThumbController() {
        if (this._copiedIndex === null) {
            return null;
        }
        return this.getThumbControllerByIndex(this._copiedIndex);
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
        this.reloadThumbControllers();
    }
    get selectedIndex() {
        return this._selectedIndex;
    }
    get selectedThumbController() {
        if (this._selectedIndex === null) {
            return null;
        }
        return this._thumbControllers[this._selectedIndex] || null;
    }
    get thumbWidth() {
        return this._thumbWidth;
    }
    set thumbWidth(newThumbWidth: number) {
        this._thumbWidth = newThumbWidth;
    }
    get isModifying() {
        return this._isModifying;
    }
    set isModifying(newIsModifying: boolean) {
        this._isModifying = newIsModifying;
    }
    get isWrongDimension() {
        return this._isWrongDimension;
    }
    get undo() {
        return this._history.undo;
    }
    get redo() {
        return this._history.redo;
    }
    set undo(newUndo: ChangeHistory[]) {
        this._history.undo = newUndo;
    }
    set redo(newRedo: ChangeHistory[]) {
        this._history.undo = newRedo;
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
        this._isWrongDimension = false;
    }
    save() {
        try {
            const filePath = getSlideItemSelectedSetting();
            if (filePath !== null) {
                const str = readFile(filePath);
                if (str !== null) {
                    const json = JSON.parse(str);
                    if (validateSlide(json)) {
                        json.items = this._thumbControllers.map((thumbController) => {
                            return thumbController.toJson();
                        });
                        if (deleteFile(filePath) && createFile(JSON.stringify(json), filePath)) {
                            toastEventListener.showSimpleToast({
                                title: 'Saving Slide',
                                message: 'Unable to save slide due to internal error',
                            });
                            this.isModifying = true;
                            return true;
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
        return false;
    }
    select(index: number | null) {
        this._selectedIndex = index;
        if (index === null) {
            setSetting(THUMB_SELECTED_SETTING_NAME, '');
            if (isWindowEditingMode()) {
                slideListEventListenerGlobal.selectSlideItemThumb(null);
            }
            return;
        }
        const id = this.selectedThumbController?.id as string;
        const selected = toSlideItemThumbSelected(this.filePath, id);
        setSetting(THUMB_SELECTED_SETTING_NAME, selected || '');
        slideListEventListenerGlobal.selectSlideItemThumb((this.selectedThumbController as any).item);
    }
    duplicate(index: number) {
        const newItems = this.currentItems;
        const newItem: SlideItemThumbType = cloneObject(newItems[index]);
        newItem.id = `${this.maxId + 1}`;
        newItems.splice(index + 1, 0, newItem);
        this.setItemsWithHistory(newItems);
    }
    paste() {
        if (this.copiedThumbController !== null) {
            const newItem: SlideItemThumbType = cloneObject(this.copiedThumbController.item);
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
}

class ThumbController {
    _thumbItem: SlideItemThumbType;
    constructor(thumbItem: SlideItemThumbType) {
        this._thumbItem = thumbItem;
    }
    get item() {
        return this._thumbItem;
    }
    get id() {
        return this._thumbItem.id;
    }
    get html() {
        return this._thumbItem.html;
    }
    toJson() {
        return {
            id: this.id,
            html: this.html,
        };
    }

}
