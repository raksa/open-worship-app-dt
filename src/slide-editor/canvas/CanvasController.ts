import EventHandler from '../../event/EventHandler';
import SlideItem from '../../slide-list/SlideItem';
import Canvas from './Canvas';
import CanvasItem from './CanvasItem';
import { ToolingType } from './canvasHelpers';

type ListenerType<T> = (data: T) => void;
export type CCEventType = 'select' | 'start-editing' | 'update';
export type RegisteredEventType<T> = {
    type: CCEventType,
    listener: ListenerType<T>,
};

export default class CanvasController extends EventHandler {
    copiedItem: CanvasItem | null;
    _selectedItem: CanvasItem | null;
    _canvas: Canvas;
    _slideItem: SlideItem;
    static _instant: CanvasController | null = null;
    constructor(slideItem: SlideItem) {
        super();
        this.copiedItem = null;
        this._selectedItem = null;
        this._slideItem = slideItem;
        (window as any).cc = this;
        this._canvas = Canvas.fromHtml(this, this.slideItem.html);
    }
    get slideItem() {
        return this._slideItem;
    }
    set slideItem(slideItem: SlideItem) {
        this._slideItem = slideItem;
        this._canvas = Canvas.fromHtml(this, this.slideItem.html);
    }
    get selectedCanvasItems() {
        return this.canvasItems.filter((item) => item.isSelected);
    }
    get isCopied() {
        if (this.copiedItem === null) {
            return false;
        }
        return this.canvasItems.indexOf(this.copiedItem) > -1;
    }
    get newCanvasItems() {
        return [...this._canvas.canvasItems];
    }
    get canvas() {
        return this._canvas;
    }
    set canvas(newCanvas: Canvas) {
        this._canvas = newCanvas;
    }
    get canvasItems() {
        return this._canvas.canvasItems;
    }
    set canvasItems(newItems: CanvasItem[]) {
        this._canvas.canvasItems = newItems;
        this.slideItem.html = this.canvas.htmlString;
        this.fireUpdateEvent();
    }
    fireSelectEvent() {
        this._addPropEvent('select');
    }
    fireStartEditingEvent(canvasItem: CanvasItem) {
        this.canvasItems.forEach((item) => {
            if (item !== canvasItem) {
                item._isEditing = false;
            }
        });
        this._addPropEvent('start-editing');
    }
    fireUpdateEvent() {
        this._addPropEvent('update');
    }
    cloneItem(canvasItem: CanvasItem) {
        const newCanvasItem = canvasItem.clone(this);
        newCanvasItem.top += 10;
        newCanvasItem.left += 10;
        return newCanvasItem;
    }
    duplicate(canvasItem: CanvasItem) {
        const newCanvasItems = this.newCanvasItems;
        const newCanvasItem = this.cloneItem(canvasItem);
        const index = this.canvasItems.indexOf(canvasItem);
        newCanvasItems.splice(index + 1, 0, newCanvasItem);
        this.canvasItems = newCanvasItems;
    }
    deleteItem(canvasItem: CanvasItem) {
        if (this.copiedItem === canvasItem) {
            this.copiedItem = null;
        }
        const newCanvasItems = this.canvasItems.filter((item) => {
            return item === canvasItem;
        });
        this.canvasItems = newCanvasItems;
    }
    paste() {
        const newCanvasItems = this.newCanvasItems;
        if (this.copiedItem !== null) {
            const newCanvasItem = this.cloneItem(this.copiedItem);
            newCanvasItems.push(newCanvasItem);
            this.canvasItems = newCanvasItems;
        }
    }
    newBox() {
        const newCanvasItems = this.newCanvasItems;
        const newBoxHTML = SlideItem.genDefaultBoxHTML();
        newCanvasItems.push(CanvasItem.fromHtml(this, newBoxHTML));
        this.canvasItems = newCanvasItems;
    }
    applyToolingData(canvasItem: CanvasItem, data: ToolingType) {
        const newCanvasItems = CanvasItem.genNewCanvasItems(this, canvasItem, data);
        if (newCanvasItems !== null) {
            this.canvasItems = newCanvasItems;
        }
    }
    registerEventListener(types: CCEventType[], listener: ListenerType<any>):
        RegisteredEventType<any>[] {
        return types.map((type) => {
            this._addOnEventListener(type, listener);
            return { type, listener };
        });
    }
    unregisterEventListener(regEvents: RegisteredEventType<any>[]) {
        regEvents.forEach(({ type, listener }) => {
            this._removeOnEventListener(type, listener);
        });
    }
    stopAllMod() {
        this.canvasItems.forEach((item) => {
            item.isSelected = false;
            item.isEditing = false;
        });
    }
    static getInstant(slideItem: SlideItem) {
        if (CanvasController._instant === null) {
            CanvasController._instant = new CanvasController(slideItem);
        }
        return CanvasController._instant;
    }
}
