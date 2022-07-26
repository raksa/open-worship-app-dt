import EventHandler from '../../event/EventHandler';
import SlideItem from '../../slide-list/SlideItem';
import Canvas from './Canvas';
import CanvasItem from './CanvasItem';
import { getSetting, setSetting } from '../../helper/settingHelper';
import FileSource from '../../helper/FileSource';
import { toastEventListener } from '../../event/ToastEventListener';
import CanvasItemText from './CanvasItemText';
import CanvasItemImage from './CanvasItemImage';
import BibleItem from '../../bible-list/BibleItem';
import { genTextDefaultHtmlString } from './box/BENTextViewMode';

type ListenerType<T> = (data: T) => void;
export type CCEventType = 'select' | 'control' | 'edit' | 'update' | 'scale';
export type RegisteredEventType<T> = {
    type: CCEventType,
    listener: ListenerType<T>,
};

export default class CanvasController extends EventHandler {
    copiedItem: CanvasItem | null;
    canvas: Canvas;
    MAX_SCALE = 3;
    MIN_SCALE = 0.2;
    SCALE_STEP = 0.1;
    _scale: number = 1;
    slideItem: SlideItem;
    static _objectId = 0;
    _objectId: number;
    static _cacheMap = new Map<string, CanvasController>();
    constructor(slideItem: SlideItem) {
        super();
        this._objectId = CanvasController._objectId++;
        this.copiedItem = null;
        this.slideItem = slideItem;
        this.canvas = Canvas.fromHtml(this, this.slideItem.htmlString);
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
        setSetting('editor-scale', n + '');
        this._addPropEvent('scale');
    }
    get isCopied() {
        if (this.copiedItem === null) {
            return false;
        }
        return this.canvas.canvasItems.indexOf(this.copiedItem) > -1;
    }
    syncHtmlString() {
        this.slideItem.htmlString = this.canvas.htmlString;
    }
    fireSelectEvent(canvasItem: CanvasItem) {
        this._addPropEvent('select', canvasItem);
    }
    fireControlEvent(canvasItem: CanvasItem) {
        this._addPropEvent('control', canvasItem);
    }
    fireEditEvent(canvasItem: CanvasItem) {
        this._addPropEvent('edit', canvasItem);
    }
    fireUpdateEvent() {
        this._addPropEvent('update', this.slideItem);
    }
    async cloneItem(canvasItem: CanvasItem) {
        const newCanvasItem = await canvasItem.clone();
        if (newCanvasItem === null) {
            return null;
        }
        newCanvasItem.props.top += 20;
        newCanvasItem.props.left += 20;
        newCanvasItem.id = this.canvas.maxItemId + 1;
        return newCanvasItem;
    }
    async duplicate(canvasItem: CanvasItem) {
        const newCanvasItems = this.canvas.newCanvasItems;
        const newCanvasItem = await this.cloneItem(canvasItem);
        if (newCanvasItem === null) {
            return;
        }
        const index = this.canvas.canvasItems.indexOf(canvasItem);
        newCanvasItems.splice(index + 1, 0, newCanvasItem);
        this.canvas.canvasItems = newCanvasItems;
    }
    deleteItem(canvasItem: CanvasItem) {
        if (this.copiedItem === canvasItem) {
            this.copiedItem = null;
        }
        const newCanvasItems = this.canvas.canvasItems.filter((item) => {
            return item !== canvasItem;
        });
        this.canvas.canvasItems = newCanvasItems;
    }
    async paste() {
        const newCanvasItems = this.canvas.newCanvasItems;
        if (this.copiedItem !== null) {
            const newCanvasItem = await this.cloneItem(this.copiedItem);
            if (newCanvasItem === null) {
                return;
            }
            newCanvasItems.push(newCanvasItem);
            this.canvas.canvasItems = newCanvasItems;
        }
    }
    addNewItem(canvasItem: CanvasItem) {
        const newCanvasItems = this.canvas.newCanvasItems;
        canvasItem.id = this.canvas.maxItemId + 1;
        newCanvasItems.push(canvasItem);
        this.canvas.canvasItems = newCanvasItems;
    }
    async addNewTextBox() {
        const newBoxHTML = genTextDefaultHtmlString();
        const newCanvasItem = await CanvasItemText.fromHtml(this, newBoxHTML);
        this.addNewItem(newCanvasItem);
    }
    async addNewMedia(fileSource: FileSource, event: any) {
        try {
            const rect = (event.target as HTMLDivElement).getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / this.scale);
            const y = Math.floor((event.clientY - rect.top) / this.scale);
            if (fileSource.metadata?.mimeType.mimeTypeName === 'image') {
                const newItem = await CanvasItemImage.genFromInsertion(this, x, y, fileSource);
                this.addNewItem(newItem);
                return;
            }
        } catch (error) {
            console.log(error);
        }
        toastEventListener.showSimpleToast({
            title: 'Insert Image or Video',
            message: 'Fail to insert medias',
        });
    }
    async addNewBibleItem(bibleItem: BibleItem) {
        // TODO: add bible item
        const newBoxHTML = genTextDefaultHtmlString();
        const newCanvasItem = await CanvasItemText.fromHtml(this, newBoxHTML);
        this.addNewItem(newCanvasItem);
    }
    applyOrderingData(canvasItem: CanvasItem, isBack: boolean) {
        const newCanvasItems = this.canvas.canvasItems.map((item) => {
            if (item === canvasItem) {
                item.props.zIndex = isBack ? 1 : 2;
            } else {
                item.props.zIndex = isBack ? 2 : 1;
            }
            return item;
        });
        this.canvas.canvasItems = newCanvasItems;
    }
    stopAllMods(isSilent?: boolean) {
        this.canvas.canvasItems.forEach((item) => {
            if (isSilent) {
                item._isSelected = false;
                item._isControlling = false;
                item._isEditing = false;
            } else {
                item.isSelected = false;
                item.isControlling = false;
                item.isEditing = false;
            }
        });
    }
    applyScale(isUp: boolean) {
        let newScale = this.scale + (isUp ? -1 : 1) * this.SCALE_STEP;
        if (newScale < this.MIN_SCALE) {
            newScale = this.MIN_SCALE;
        }
        if (newScale > this.MAX_SCALE) {
            newScale = this.MAX_SCALE;
        }
        this.scale = newScale;
    }
    static getInstant(slideItem: SlideItem) {
        const slideItemKey = slideItem.genKey();
        if (this._cacheMap.has(slideItemKey)) {
            return this._cacheMap.get(slideItemKey) as CanvasController;
        }
        const canvasController = new CanvasController(slideItem);
        this._cacheMap.set(slideItemKey, canvasController);
        return canvasController;
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
}
