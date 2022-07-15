import EventHandler from '../../event/EventHandler';
import SlideItem from '../../slide-list/SlideItem';
import Canvas from './Canvas';
import CanvasItem from './CanvasItem';
import { ToolingType } from './canvasHelpers';
import { getSetting } from '../../helper/settingHelper';

type ListenerType<T> = (data: T) => void;
export type CCEventType = 'select' | 'control' | 'edit' | 'update' | 'scale';
export type RegisteredEventType<T> = {
    type: CCEventType,
    listener: ListenerType<T>,
};

export default class CanvasController extends EventHandler {
    copiedItem: CanvasItem | null;
    _selectedItem: CanvasItem | null;
    _canvas: Canvas;
    MAX_SCALE = 3;
    MIN_SCALE = 0.2;
    SCALE_STEP = 0.1;
    _scale: number = 1;
    _slideItem: SlideItem;
    static _instant: CanvasController | null = null;
    constructor(slideItem: SlideItem) {
        super();
        this.copiedItem = null;
        this._selectedItem = null;
        this._slideItem = slideItem;
        this._canvas = Canvas.fromHtml(this, this.slideItem.html);
        const defaultData = +(getSetting('editor-scale') || NaN);
        if (!isNaN(defaultData)) {
            this._scale = defaultData;
        }
    }
    get scale() {
        return this._scale;
    }
    set scale(n: number) {
        this._scale = n;
        this._addPropEvent('scale');
    }
    get slideItem() {
        return this._slideItem;
    }
    set slideItem(slideItem: SlideItem) {
        this._slideItem = slideItem;
        this._canvas = Canvas.fromHtml(this, this.slideItem.html);
        this.fireUpdateEvent();
    }
    get selectedCanvasItems() {
        return this.canvas.canvasItems.filter((item) => item.isSelected);
    }
    get isCopied() {
        if (this.copiedItem === null) {
            return false;
        }
        return this.canvas.canvasItems.indexOf(this.copiedItem) > -1;
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
    fireSelectEvent() {
        this._addPropEvent('select');
    }
    fireControlEvent(canvasItem: CanvasItem) {
        this.canvas.canvasItems.forEach((item) => {
            if (item !== canvasItem) {
                item._isControlling = false;
            }
        });
        this._addPropEvent('control');
        this.fireSelectEvent();
    }
    fireEditEvent(canvasItem: CanvasItem) {
        this.canvas.canvasItems.forEach((item) => {
            if (item !== canvasItem) {
                item._isEditing = false;
            }
        });
        this._addPropEvent('edit');
    }
    fireUpdateEvent() {
        this.slideItem.html = this.canvas.htmlString;
        this._addPropEvent('update', this.slideItem);
    }
    cloneItem(canvasItem: CanvasItem) {
        const newCanvasItem = canvasItem.clone(this);
        newCanvasItem.props.top += 10;
        newCanvasItem.props.left += 10;
        return newCanvasItem;
    }
    duplicate(canvasItem: CanvasItem) {
        const newCanvasItems = this.newCanvasItems;
        const newCanvasItem = this.cloneItem(canvasItem);
        const index = this.canvas.canvasItems.indexOf(canvasItem);
        newCanvasItems.splice(index + 1, 0, newCanvasItem);
        this.canvas.canvasItems = newCanvasItems;
    }
    deleteItem(canvasItem: CanvasItem) {
        if (this.copiedItem === canvasItem) {
            this.copiedItem = null;
        }
        const newCanvasItems = this.canvas.canvasItems.filter((item) => {
            return item === canvasItem;
        });
        this.canvas.canvasItems = newCanvasItems;
    }
    paste() {
        const newCanvasItems = this.newCanvasItems;
        if (this.copiedItem !== null) {
            const newCanvasItem = this.cloneItem(this.copiedItem);
            newCanvasItems.push(newCanvasItem);
            this.canvas.canvasItems = newCanvasItems;
        }
    }
    newBox() {
        const newCanvasItems = this.newCanvasItems;
        const newBoxHTML = SlideItem.genDefaultBoxHTML();
        newCanvasItems.push(CanvasItem.fromHtml(this, newBoxHTML));
        this.canvas.canvasItems = newCanvasItems;
    }
    applyToolingData(canvasItem: CanvasItem, data: ToolingType) {
        if (data.box?.layerBack || data.box?.layerFront) {
            const newCanvasItems = this.canvas.canvasItems.map((item) => {
                if (item === canvasItem) {
                    item.props.zIndex = data.box?.layerBack ? 1 : 2;
                } else {
                    item.props.zIndex = data.box?.layerBack ? 2 : 1;
                }
                return item;
            });
            this.canvas.canvasItems = newCanvasItems;
        }
        canvasItem.applyToolingData(data);
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
        this.canvas.canvasItems.forEach((item) => {
            item.isControlling = false;
            item.isEditing = false;
        });
    }
    static getInstant(slideItem: SlideItem) {
        if (CanvasController._instant === null) {
            CanvasController._instant = new CanvasController(slideItem);
        }
        if (CanvasController._instant.slideItem.id !== slideItem.id) {
            CanvasController._instant.slideItem = slideItem;
        }
        return CanvasController._instant;
    }
    applyScale(isUp: boolean){
        let newScale = this.scale + (isUp ? -1 : 1) * this.SCALE_STEP;
        if (newScale < this.MIN_SCALE) {
            newScale = this.MIN_SCALE;
        }
        if (newScale > this.MAX_SCALE) {
            newScale = this.MAX_SCALE;
        }
        this.scale = newScale;
    };
}
