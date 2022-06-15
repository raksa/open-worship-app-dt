import {
    getSlideDataByFilePath,
    getSlideDataByFilePathNoCache,
    HTML2React,
} from '../helper/slideHelper';
import fileHelpers, { FileSource } from '../helper/fileHelper';
import FileController from '../others/FileController';
import { toastEventListener } from '../event/ToastEventListener';
import {
    getSetting,
    getSlideItemSelectedSetting,
    setSetting,
} from '../helper/settingHelper';
import {
    parseSlideItemThumbSelected,
    toSlideItemThumbSelected,
} from '../helper/helpers';
import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { isWindowEditingMode } from '../App';
import { showAppContextMenu } from '../others/AppContextMenu';
import { openItemSlideEdit } from '../editor/SlideItemEditorPopup';
import { DisplayType } from '../helper/displayHelper';
import SlideItemThumb from './SlideItemThumb';

export const MIN_THUMB_SCALE = 1;
export const THUMB_SCALE_STEP = 0.2;
export const MAX_THUMB_SCALE = 3;
export const DEFAULT_THUMB_SIZE = 250;
export const THUMB_SELECTED_SETTING_NAME = 'slide-item-thumb-selected';
export const THUMB_WIDTH_SETTING_NAME = 'presenting-item-thumb-size';
export type ChangeHistory = { items: SlideItemThumb[] };

export default class SlideThumbsController extends FileController {
    _items: SlideItemThumb[] = [];
    _copiedIndex: number | null = null;
    _selectedId: string | null = null;
    _history: {
        undo: ChangeHistory[];
        redo: ChangeHistory[];
    } = { undo: [], redo: [] };
    constructor(fileSource: FileSource) {
        super(fileSource);
        this._copiedIndex = null;
        this.selectedId = null;
        this._history = { undo: [], redo: [] };
        const slideItemThumbSelected = getSetting(THUMB_SELECTED_SETTING_NAME, '');
        const parsed = parseSlideItemThumbSelected(slideItemThumbSelected, this.filePath);
        if (parsed !== null && this.getItemById(parsed.id)) {
            this.select(parsed.id);
        }
        getSlideDataByFilePath(this.filePath).then((slidePresentData) => {
            if (slidePresentData === null) {
                const message = 'Unable to read slide data';
                toastEventListener.showSimpleToast({
                    title: 'Initializing Slide Data',
                    message,
                });
                throw new Error(message);
            }
            this._items = slidePresentData.items;
        });
    }
    refresh() {
        slideListEventListenerGlobal.refresh();
    }
    getItemByIndex(index: number): SlideItemThumb | null {
        return this._items[index] || null;
    }
    getItemById(id: string): SlideItemThumb | null {
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
        this.refresh();
    }
    get items() {
        return this._items;
    }
    get currentItems() {
        return [...this._items];
    }
    set items(newItems: SlideItemThumb[]) {
        newItems.forEach((item, i) => {
            item.index = i;
        });
        this._items = newItems;
        this.refresh();
    }
    get selectedIndex() {
        if (this.selectedItem === null) {
            return null;
        }
        return this._items.indexOf(this.selectedItem);
    }
    get selectedId() {
        return this._selectedId;
    }
    set selectedId(id: string | null) {
        this._selectedId = id;
        this.refresh();
    }
    get selectedItem() {
        if (this._selectedId === null) {
            return null;
        }
        return this.getItemById(this._selectedId);
    }
    async isModifying() {
        for (const item of this._items) {
            if (await item.isEditing()) {
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
        this.refresh();
    }
    get redo() {
        return this._history.redo;
    }
    set redo(redo: ChangeHistory[]) {
        this._history.redo = redo;
        this.refresh();
    }
    get maxId() {
        return Math.max.apply(Math, this.items.map((item) => +item.id));
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
        }
    }
    checkIsWrongDimension({ bounds }: DisplayType) {
        const found = this.items.map((item) => {
            const html2React = HTML2React.parseHTML(item.html);
            return { width: html2React.width, height: html2React.height };
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
        this.currentItems.forEach((item) => {
            const html2React = HTML2React.parseHTML(item.html);
            html2React.width = bounds.width;
            html2React.height = bounds.height;
            item.html = html2React.htmlString;
        });
        if (await this.save()) {
            toastEventListener.showSimpleToast({
                title: 'Fix Slide Dimension',
                message: 'Slide dimension has been fixed',
            });
        } else {
            toastEventListener.showSimpleToast({
                title: 'Fix Slide Dimension',
                message: 'Unable to fix slide dimension',
            });
        }
    }
    async save() {
        try {
            const filePath = getSlideItemSelectedSetting();
            if (filePath !== null) {
                const slideData = await getSlideDataByFilePathNoCache(filePath) as any;
                if (slideData !== null) {
                    slideData.items = this.currentItems.map((item) => {
                        return item.toJson();
                    });
                    await fileHelpers.overWriteFile(filePath, JSON.stringify(slideData));
                    toastEventListener.showSimpleToast({
                        title: 'Saving Slide',
                        message: 'Slide has been saved',
                    });
                    this.refresh();
                    return true;
                }
            }
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Saving Slide',
                message: error.message,
            });
        }
        return false;
    }
    select(id: string | null) {
        this.selectedId = id;
        if (id === null) {
            slideListEventListenerGlobal.clearSelectSlideItemThumb();
            if (isWindowEditingMode()) {
                slideListEventListenerGlobal.selectSlideItemThumb(null);
            }
            return;
        }
        const selected = toSlideItemThumbSelected(this.filePath, id);
        setSetting(THUMB_SELECTED_SETTING_NAME, selected || '');
        slideListEventListenerGlobal.selectSlideItemThumb((this.selectedItem as SlideItemThumb));
    }
    duplicate(index: number) {
        const newItems = this.currentItems;
        const newItem = newItems[index].clone();
        newItem.id = `${this.maxId + 1}`;
        newItems.splice(index + 1, 0, newItem);
        this.setItemsWithHistory(newItems);
    }
    paste() {
        if (this.copiedItem !== null) {
            const newItem = this.copiedItem.clone();
            newItem.id = `${this.maxId + 1}`;
            const newItems: SlideItemThumb[] = [...this.items, newItem];
            this.setItemsWithHistory(newItems);
        }
    }
    deleteItem(index: number) {
        if (this.selectedItem !== null && index === this._items.indexOf(this.selectedItem)) {
            this.select(null);
        }
        const newItems = this.items.filter((_, i) => i !== index);
        this.setItemsWithHistory(newItems);
    }
    setItemsWithHistory(newItems: SlideItemThumb[]) {
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
        this.setItemsWithHistory(currentItems);
        slideListEventListenerGlobal.ordering();
    }
    showSlideItemContextMenu(e: any) {
        showAppContextMenu(e, [{
            title: 'Paste', disabled: this.copiedIndex === null,
            onClick: () => this.paste(),
        }]);
    }
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
                            this.select(item.id);
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
    static toScaleThumbSize(isUp: boolean, currentScale: number) {
        let newScale = currentScale + (isUp ? -1 : 1) * THUMB_SCALE_STEP;
        if (newScale < MIN_THUMB_SCALE) {
            newScale = MIN_THUMB_SCALE;
        }
        if (newScale > MAX_THUMB_SCALE) {
            newScale = MAX_THUMB_SCALE;
        }
        return newScale;
    }
}
