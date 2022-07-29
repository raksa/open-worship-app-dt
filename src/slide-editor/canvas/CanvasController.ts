import EventHandler from '../../event/EventHandler';
import Canvas from './Canvas';
import CanvasItem from './CanvasItem';
import {
    getSetting, setSetting,
} from '../../helper/settingHelper';
import FileSource from '../../helper/FileSource';
import { toastEventListener } from '../../event/ToastEventListener';
import CanvasItemText from './CanvasItemText';
import CanvasItemImage from './CanvasItemImage';
import BibleItem from '../../bible-list/BibleItem';
import CanvasItemBible from './CanvasItemBible';
import { anyObjectType } from '../../helper/helpers';
import SlideItem from '../../slide-list/SlideItem';

type ListenerType<T> = (data: T) => void;
export type CCEventType = 'select' | 'control' | 'edit' | 'update' | 'scale';
export type RegisteredEventType<T> = {
    type: CCEventType,
    listener: ListenerType<T>,
};

class CanvasController extends EventHandler {
    copiedItem: CanvasItem<any> | null = null;
    canvas: Canvas | null = null;
    MAX_SCALE = 3;
    MIN_SCALE = 0.2;
    SCALE_STEP = 0.1;
    _scale: number = 1;
    constructor() {
        super();
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
        if (this.copiedItem === null || this.canvas === null) {
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
    async fireUpdateEvent() {
        debugger;
        const slideItem = await SlideItem.getSelectedItem();
        const canvas = this.canvas;
        if (slideItem && canvas !== null) {
            slideItem.canvas = canvas;
        }
        this._addPropEvent('update');
    }
    async cloneItem(canvasItem: CanvasItem<any>) {
        if (this.canvas === null) {
            return null;
        }
        const newCanvasItem = canvasItem.clone();
        newCanvasItem.props.top += 20;
        newCanvasItem.props.left += 20;
        newCanvasItem.id = this.canvas.maxItemId + 1;
        return newCanvasItem;
    }
    async duplicate(canvasItem: CanvasItem<any>) {
        if (this.canvas === null) {
            return;
        }
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
        if (this.canvas === null) {
            return;
        }
        if (this.copiedItem === canvasItem) {
            this.copiedItem = null;
        }
        const newCanvasItems = this.canvas.canvasItems.filter((item) => {
            return item !== canvasItem;
        });
        this.setCanvasItems(newCanvasItems);
    }
    async paste() {
        if (this.canvas === null) {
            return;
        }
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
        if (this.canvas === null) {
            return;
        }
        const newCanvasItems = this.canvas.newCanvasItems;
        canvasItem.id = this.canvas.maxItemId + 1;
        newCanvasItems.push(canvasItem);
        this.setCanvasItems(newCanvasItems);
    }
    async addNewTextBox() {
        const newItem = CanvasItemText.genDefaultItem();
        this.addNewItem(newItem);
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
        const newItem = CanvasItemBible.fromBibleItem(bibleItem);
        this.addNewItem(newItem);
    }
    applyOrderingData(canvasItem: CanvasItem<any>, isBack: boolean) {
        if (this.canvas === null) {
            return;
        }
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
        if (this.canvas === null) {
            return;
        }
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
    setCanvasItems(canvasItems: CanvasItem<any>[]) {
        if (this.canvas === null) {
            return;
        }
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
    checkValidCanvasItem(json: anyObjectType) {
        if (CanvasItem.checkIsTypeText(json.type)) {
            return CanvasItemText.validate(json);
        }
        if (CanvasItem.checkIsTypeBible(json.type)) {
            return CanvasItemBible.validate(json);
        }
        if (CanvasItem.checkIsTypeImage(json.type)) {
            return CanvasItemBible.validate(json);
        }
        throw new Error('Invalid canvas item type');
    }
    async initCanvasItems(canvasItems: CanvasItem<any>[]) {
        await Promise.all(canvasItems.map((canvasItem) => {
            return canvasItem.initProps();
        }));
    }
    async initCanvasItemsProps(canvasItemJson: anyObjectType[]) {
        await Promise.all(canvasItemJson.map((json) => {
            if (CanvasItem.checkIsTypeImage(json.type)) {
                return new Promise<void>((resolve) => {
                    CanvasItemImage.loadSrc(json.filePath).then((src) => {
                        json.src = src;
                        resolve();
                    });
                });
            }
            return Promise.resolve();
        }));
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

export const canvasController = new CanvasController();
