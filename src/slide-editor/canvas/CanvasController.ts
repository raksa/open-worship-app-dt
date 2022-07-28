import EventHandler from '../../event/EventHandler';
import SlideItem, { SlideItemContext } from '../../slide-list/SlideItem';
import Canvas from './Canvas';
import CanvasItem from './CanvasItem';
import { getSetting, setSetting } from '../../helper/settingHelper';
import FileSource from '../../helper/FileSource';
import { toastEventListener } from '../../event/ToastEventListener';
import CanvasItemText, { genTextDefaultProps } from './CanvasItemText';
import CanvasItemImage from './CanvasItemImage';
import BibleItem from '../../bible-list/BibleItem';
import CanvasItemBible from './CanvasItemBible';
import { useContext } from 'react';
import { anyObjectType } from '../../helper/helpers';

type ListenerType<T> = (data: T) => void;
export type CCEventType = 'select' | 'control' | 'edit' | 'update' | 'scale';
export type RegisteredEventType<T> = {
    type: CCEventType,
    listener: ListenerType<T>,
};

export default class CanvasController extends EventHandler {
    copiedItem: CanvasItem<any> | null;
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
        this.canvas = Canvas.fromSlideItem(this.slideItem);
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
    fireSelectEvent(canvasItem: CanvasItem<any>) {
        this._addPropEvent('select', canvasItem);
    }
    fireControlEvent(canvasItem: CanvasItem<any>) {
        this._addPropEvent('control', canvasItem);
    }
    fireEditEvent(canvasItem: CanvasItem<any>) {
        this._addPropEvent('edit', canvasItem);
    }
    fireUpdateEvent() {
        this._addPropEvent('update', this.slideItem);
    }
    async cloneItem(canvasItem: CanvasItem<any>) {
        const newCanvasItem = canvasItem.clone();
        newCanvasItem.props.top += 20;
        newCanvasItem.props.left += 20;
        newCanvasItem.id = this.canvas.maxItemId + 1;
        return newCanvasItem;
    }
    async duplicate(canvasItem: CanvasItem<any>) {
        const newCanvasItems = this.canvas.newCanvasItems;
        const newCanvasItem = await this.cloneItem(canvasItem);
        if (newCanvasItem === null) {
            return;
        }
        const index = this.canvas.canvasItems.indexOf(canvasItem);
        newCanvasItems.splice(index + 1, 0, newCanvasItem);
        this.setCanvasItems(newCanvasItems);
    }
    deleteItem(canvasItem: CanvasItem<any>) {
        if (this.copiedItem === canvasItem) {
            this.copiedItem = null;
        }
        const newCanvasItems = this.canvas.canvasItems.filter((item) => {
            return item !== canvasItem;
        });
        this.setCanvasItems(newCanvasItems);
    }
    async paste() {
        const newCanvasItems = this.canvas.newCanvasItems;
        if (this.copiedItem !== null) {
            const newCanvasItem = await this.cloneItem(this.copiedItem);
            if (newCanvasItem === null) {
                return;
            }
            newCanvasItems.push(newCanvasItem);
            this.setCanvasItems(newCanvasItems);
        }
    }
    addNewItem(canvasItem: CanvasItem<any>) {
        const newCanvasItems = this.canvas.newCanvasItems;
        canvasItem.id = this.canvas.maxItemId + 1;
        newCanvasItems.push(canvasItem);
        this.setCanvasItems(newCanvasItems);
    }
    async addNewTextBox() {
        const props = genTextDefaultProps();
        const newCanvasItem = CanvasItemText.fromJson(props);
        this.addNewItem(newCanvasItem);
    }
    async addNewMedia(fileSource: FileSource, event: any) {
        try {
            const rect = (event.target as HTMLDivElement).getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / this.scale);
            const y = Math.floor((event.clientY - rect.top) / this.scale);
            if (fileSource.metadata?.appMimetype.mimetypeName === 'image') {
                const newItem = await CanvasItemImage.genFromInsertion(x, y, fileSource);
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
        const props = genTextDefaultProps();
        const newCanvasItem = CanvasItemBible.fromJson({
            bibleNames: [bibleItem.bibleName],
            bibleItem: bibleItem.toJson(),
            ...props,
        });
        this.addNewItem(newCanvasItem);
    }
    applyOrderingData(canvasItem: CanvasItem<any>, isBack: boolean) {
        const newCanvasItems = this.canvas.canvasItems.map((item) => {
            if (item === canvasItem) {
                item.props.zIndex = isBack ? 1 : 2;
            } else {
                item.props.zIndex = isBack ? 2 : 1;
            }
            return item;
        });
        this.setCanvasItems(newCanvasItems);
    }
    stopAllMods(isSilent?: boolean) {
        this.canvas.canvasItems.forEach((item) => {
            if (isSilent) {
                item.isSelected = false;
                item.isControlling = false;
                item.isEditing = false;
            } else {
                this.setItemIsSelecting(item, false);
                this.setItemIsControlling(item, false);
                this.setItemIsEditing(item, false);
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
    setCanvasItems(canvasItems: CanvasItem<any>[]) {
        this.canvas.canvasItems = canvasItems;
        this.fireUpdateEvent();
    }
    setItemIsSelecting(canvasItem: CanvasItem<any>, b: boolean) {
        canvasItem.isSelected = b;
        this.fireSelectEvent(canvasItem);
    }
    setItemIsControlling(canvasItem: CanvasItem<any>, b: boolean) {
        canvasItem.isControlling = b;
        this.fireControlEvent(canvasItem);
    }
    setItemIsEditing(canvasItem: CanvasItem<any>, b: boolean) {
        canvasItem.isEditing = b;
        this.fireEditEvent(canvasItem);
    }
    static checkValidCanvasItem(json: anyObjectType) {
        if(json.type === 'text') {
            CanvasItemText.validate(json);
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
}

export function useContextCC() {
    const slideItem = useContext(SlideItemContext);
    if (slideItem === null) {
        return null;
    }
    return CanvasController.getInstant(slideItem);
}
