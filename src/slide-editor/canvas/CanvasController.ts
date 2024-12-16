import EventHandler from '../../event/EventHandler';
import Canvas from './Canvas';
import CanvasItem, {
    CanvasItemPropsType,
} from './CanvasItem';
import {
    getSetting, setSetting,
} from '../../helper/settingHelpers';
import FileSource from '../../helper/FileSource';
import CanvasItemText from './CanvasItemText';
import CanvasItemImage from './CanvasItemImage';
import CanvasItemBibleItem from './CanvasItemBibleItem';
import BibleItem from '../../bible-list/BibleItem';
import SlideItem from '../../slide-list/SlideItem';
import {
    CanvasItemMediaPropsType, CanvasControllerEventType,
} from './canvasHelpers';
import CanvasItemVideo from './CanvasItemVideo';
import { showSimpleToast } from '../../toast/toastHelpers';
import { handleError } from '../../helper/errorHelpers';
import { createContext, use } from 'react';

const EDITOR_SCALE_SETTING_NAME = 'canvas-editor-scale';

export type CanvasItemEventDataType = { canvasItems: CanvasItem<any>[] };

export default class CanvasController extends
    EventHandler<CanvasControllerEventType> {

    static readonly eventNamePrefix: string = 'canvas-c';
    copiedItem: CanvasItem<any> | null = null;
    private readonly _canvas: Canvas;
    readonly slideItem: SlideItem;
    private _scale: number = 1;
    constructor(slideItem: SlideItem) {
        super();
        this._canvas = Canvas.genDefaultCanvas();
        const defaultData = parseFloat(getSetting(EDITOR_SCALE_SETTING_NAME));
        if (!isNaN(defaultData)) {
            this._scale = defaultData;
        }
        this.slideItem = slideItem;
        this._canvas = slideItem.canvas || Canvas.genDefaultCanvas();
    }
    get canvas() {
        return this._canvas;
    }
    get scale() {
        return this._scale;
    }
    set scale(n: number) {
        this._scale = n;
        setSetting(EDITOR_SCALE_SETTING_NAME, n.toString());
        this.addPropEvent('scale', { canvasItems: this.canvas.canvasItems });
    }
    get isCopied() {
        if (this.copiedItem === null) {
            return false;
        }
        return this.canvas.canvasItems.includes(this.copiedItem);
    }
    addPropEvent(
        eventName: CanvasControllerEventType, data: CanvasItemEventDataType,
    ): void {
        super.addPropEvent(eventName, data);
    }
    fireSelectEvent(canvasItem: CanvasItem<any>) {
        this.addPropEvent('select', { canvasItems: [canvasItem] });
    }
    fireControlEvent(canvasItem: CanvasItem<any>) {
        this.addPropEvent('control', { canvasItems: [canvasItem] });
    }
    fireTextEditEvent(canvasItem: CanvasItem<any>) {
        this.addPropEvent('text-edit', { canvasItems: [canvasItem] });
    }
    fireUpdateEvent(canvasItem?: CanvasItem<any>) {
        if (this.slideItem !== null) {
            this.slideItem.canvas = this.canvas;
        }
        this.addPropEvent('update', {
            canvasItems: (
                canvasItem !== undefined ? [canvasItem] :
                    this.canvas.canvasItems
            ),
        });
    }
    async cloneItem(canvasItem: CanvasItem<any>) {
        const newCanvasItem = canvasItem.clone();
        newCanvasItem.props.top += 20;
        newCanvasItem.props.left += 20;
        newCanvasItem.props.id = this.canvas.maxItemId + 1;
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
        canvasItem.props.id = this.canvas.maxItemId + 1;
        newCanvasItems.push(canvasItem);
        this.setCanvasItems(newCanvasItems);
    }
    async addNewTextItem() {
        const newItem = CanvasItemText.genDefaultItem();
        this.addNewItem(newItem);
    }
    getMousePosition(event: any) {
        const rect = (
            (event.target as HTMLDivElement).getBoundingClientRect()
        );
        const x = Math.floor((event.clientX - rect.left) / this.scale);
        const y = Math.floor((event.clientY - rect.top) / this.scale);
        return { x, y };
    }
    async genNewMediaItemFromFilePath(filePath: string, event: any) {
        try {
            const fileSource = FileSource.getInstance(filePath);
            const mediaType = (
                fileSource.metadata?.appMimetype.mimetypeName || ''
            );
            if (!['image', 'video'].includes(mediaType)) {
                showSimpleToast(
                    'Insert Medias', 'Only image and video files are supported',
                );
                return;
            }
            const { x, y } = this.getMousePosition(event);
            const newItem = (
                await (mediaType === 'image' ?
                    CanvasItemImage.genFromInsertion(x, y, filePath) :
                    CanvasItemVideo.genFromInsertion(x, y, filePath))
            );
            return newItem;
        } catch (error) {
            handleError(error);
        }
        showSimpleToast('Insert Image or Video', 'Fail to insert medias');
    }
    async genNewImageItemFromBlob(blob: Blob, event: any) {
        try {
            const { x, y } = this.getMousePosition(event);
            const newItem = CanvasItemImage.genFromBlob(x, y, blob);
            return newItem;
        } catch (error) {
            handleError(error);
        }
        showSimpleToast('Pasting Image', 'Fail to insert image');
    }
    async addNewBibleItem(bibleItem: BibleItem) {
        const id = this.canvas.maxItemId + 1;
        const newItem = await CanvasItemBibleItem.fromBibleItem(id, bibleItem);
        this.addNewItem(newItem);
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
    scaleCanvasItemToSize(
        canvasItem: CanvasItem<any>, targetWidth: number, targetHeight: number,
        width: number, height: number,
    ) {
        const scale = Math.min(
            targetWidth / width, targetHeight / height,
        );
        const props = canvasItem.props as CanvasItemPropsType;
        props.width = width * scale;
        props.height = height * scale;
        const targetDimension = {
            parentWidth: this.canvas.width,
            parentHeight: this.canvas.height,
        };
        canvasItem.applyBoxData(targetDimension, {
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
        });
        this.fireUpdateEvent(canvasItem);
    }
    applyCanvasItemFully(canvasItem: CanvasItem<any>) {
        const props = canvasItem.props as CanvasItemPropsType;
        let width = props.width;
        let height = props.height;
        if (['image', 'video'].includes(canvasItem.type)) {
            const mediaProps = props as any as CanvasItemMediaPropsType;
            width = mediaProps.mediaWidth;
            height = mediaProps.mediaHeight;
        }
        const targetWidth = this.canvas.width;
        const targetHeight = this.canvas.height;
        this.scaleCanvasItemToSize(
            canvasItem, targetWidth, targetHeight, width, height,
        );
    }
    applyCanvasItemMediaStrip(canvasItem: CanvasItem<any>) {
        if (!['image', 'video'].includes(canvasItem.type)) {
            return;
        }
        const props = canvasItem.props as CanvasItemPropsType;
        const targeWidth = props.width;
        const targetHeightHeight = props.height;
        const mediaProps = props as any as CanvasItemMediaPropsType;
        const width = mediaProps.mediaWidth;
        const height = mediaProps.mediaHeight;
        this.scaleCanvasItemToSize(
            canvasItem, targeWidth, targetHeightHeight, width, height,
        );
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
    setCanvasItems(canvasItems: CanvasItem<any>[]) {
        this.canvas.canvasItems = canvasItems;
        this.fireUpdateEvent();
    }
    setItemIsSelecting(canvasItem: CanvasItem<any>, isSelected: boolean) {
        canvasItem.isSelected = isSelected;
        this.fireSelectEvent(canvasItem);
        this.setItemIsControlling(canvasItem, isSelected);
    }
    setItemIsControlling(canvasItem: CanvasItem<any>, isControlling: boolean) {
        canvasItem.isControlling = isControlling;
        this.fireControlEvent(canvasItem);
    }
    setItemIsEditing(canvasItem: CanvasItem<any>, isEditing: boolean) {
        canvasItem.isEditing = isEditing;
        this.fireTextEditEvent(canvasItem);
    }

    itemRegisterEventListener(
        eventNames: CanvasControllerEventType[],
        listener: (data: CanvasItemEventDataType) => void,
    ) {
        return super.registerEventListener<CanvasItemEventDataType>(
            eventNames, listener,
        );
    }

}

export const CanvasControllerContext = (
    createContext<CanvasController | null>(null)
);
export function useCanvasControllerContext() {
    const context = use(CanvasControllerContext);
    if (context === null) {
        throw new Error('CanvasControllerContext is null');
    }
    return context;
}
