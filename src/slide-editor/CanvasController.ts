import EventHandler from '../event/EventHandler';
import SlideItem from '../slide-list/SlideItem';
import Canvas from './Canvas';
import CanvasItem from './CanvasItem';
import { ToolingType } from './helps';

type ListenerType<T> = (data: T) => void;
export enum EditingEnum {
    SELECT = 'select',
    UPDATE = 'update',
}
export type RegisteredEventType<T> = {
    type: EditingEnum,
    listener: ListenerType<T>,
};

export default class CanvasController extends EventHandler {
    copiedItem: CanvasItem | null;
    _selectedItem: CanvasItem | null;
    _canvas: Canvas;
    _slideItem: SlideItem;
    static _objectId = 0;
    _objectId: number;
    constructor(slideItem: SlideItem) {
        super();
        this._objectId = CanvasController._objectId + 1;
        this.copiedItem = null;
        this._selectedItem = null;
        this._slideItem = slideItem;
        this._canvas = Canvas.fromHtml(this, this.slideItem.html);
    }
    get slideItem() {
        return this._slideItem;
    }
    set slideItem(slideItem: SlideItem) {
        this._slideItem = slideItem;
        this._canvas = Canvas.fromHtml(this, this.slideItem.html);
    }
    get selectedCanvasItem() {
        return this._selectedItem;
    }
    set selectedCanvasItem(canvasItem: CanvasItem | null) {
        this._selectedItem = canvasItem;
        this.fireSelectEvent();
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
        this._addPropEvent(EditingEnum.SELECT);
    }
    fireUpdateEvent() {
        this._addPropEvent(EditingEnum.UPDATE);
    }
    cloneItem(canvasItem: CanvasItem) {
        const newCanvasItem = canvasItem.clone();
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
    applyToolingData(data: ToolingType) {
        const newCanvasItems = CanvasItem.genNewCanvasItems(this, data);
        if (newCanvasItems !== null) {
            this.canvasItems = newCanvasItems;
        }
    }
    registerEditingEventListener(types: EditingEnum[], listener: ListenerType<any>):
        RegisteredEventType<any>[] {
        return types.map((type) => {
            this._addOnEventListener(type, listener);
            return { type, listener };
        });
    }
    unregisterEditingEventListener(regEvents: RegisteredEventType<any>[]) {
        regEvents.forEach(({ type, listener }) => {
            this._removeOnEventListener(type, listener);
        });
    }
    destroy() {
        this.canvas.destroy();
    }
}
