import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import FileSource from '../helper/FileSource';
import { ItemBase } from '../helper/ItemBase';
import Slide from './Slide';
import slideEditingCacheManager from '../slide-editor/slideEditingCacheManager';
import { anyObjectType, cloneObject } from '../helper/helpers';
import Canvas from '../slide-editor/canvas/Canvas';
import { canvasController } from '../slide-editor/canvas/CanvasController';

export default class SlideItem extends ItemBase {
    metadata: anyObjectType;
    static SELECT_SETTING_NAME = 'slide-item-selected';
    id: number;
    fileSource: FileSource;
    _canvasItemsJson: anyObjectType[];
    isCopied: boolean;
    presentType: 'solo' | 'merge' = 'solo'; // TODO: implement this
    static copiedItem: SlideItem | null = null;
    static _cache = new Map<string, SlideItem>();
    static _objectId = 0;
    _objectId: number;
    constructor(id: number, jsonData: {
        metadata: anyObjectType,
        canvasItems: anyObjectType[],
    }, fileSource: FileSource) {
        super();
        this._objectId = SlideItem._objectId++;
        this.id = id;
        this.metadata = jsonData.metadata;
        this._canvasItemsJson = jsonData.canvasItems;
        this.fileSource = fileSource;
        this.isCopied = false;
        const key = SlideItem.genKeyByFileSource(fileSource, id);
        SlideItem._cache.set(key, this);
    }
    get canvas() {
        return Canvas.fromJson({
            metadata: this.metadata,
            canvasItems: this.canvasItemsJson,
        });
    }
    set canvas(canvas: Canvas) {
        this.canvasItemsJson = canvas.canvasItems.map(item => {
            return item.toJson();
        });
    }
    get width() {
        return this.metadata.width;
    }
    set width(width: number) {
        this.metadata.width = width;
    }
    get height() {
        return this.metadata.height;
    }
    set height(height: number) {
        this.metadata.height = height;
    }
    get isSelected() {
        const selected = SlideItem.getSelectedResult();
        return selected?.fileSource.filePath === this.fileSource.filePath &&
            selected?.id === this.id;
    }
    set isSelected(b: boolean) {
        if (this.isSelected === b) {
            return;
        }
        if (b) {
            SlideItem.setSelectedItem(this);
            slideListEventListenerGlobal.selectSlideItem(this);
        } else {
            SlideItem.setSelectedItem(null);
            slideListEventListenerGlobal.selectSlideItem(null);
        }
        this.fileSource.fireSelectEvent();
    }
    get canvasItemsJson() {
        return this._canvasItemsJson;
    }
    set canvasItemsJson(canvasItemsJson: anyObjectType[]) {
        this._canvasItemsJson = canvasItemsJson;
        slideEditingCacheManager.saveBySlideItem(this, true);
        this.fileSource.fireEditEvent(this);
    }
    async isEditing(index: number, slide?: Slide | null) {
        slide = slide || await Slide.readFileToDataNoCache(this.fileSource, true);
        if (slide) {
            const slideItem = slide.getItemById(this.id);
            if (slideItem) {
                if (index !== slide.items.indexOf(slideItem)) {
                    return true;
                }
                return JSON.stringify(slideItem.toJson()) !== JSON.stringify(this.toJson());
            } else {
                return true;
            }
        }
        return false;
    }
    static getSelectedEditingResult() {
        const selected = this.getSelectedResult();
        const slideSelected = Slide.getSelectedFileSource();
        if (selected?.fileSource.filePath === slideSelected?.filePath) {
            return selected;
        }
        return null;
    }
    static async getSelectedItem() {
        const selected = this.getSelectedEditingResult();
        if (selected !== null) {
            const slide = await Slide.readFileToData(selected.fileSource);
            return slide?.getItemById(selected.id);
        }
        return null;
    }
    static defaultSlideItemData(id: number) {
        const { width, height } = Canvas.getDefaultDim();
        return {
            id,
            metadata: {
                width,
                height,
            },
            canvasItems: [],
        };
    }
    static fromJson(json: {
        id: number, canvasItems: anyObjectType[],
        metadata: anyObjectType,
    }, fileSource: FileSource) {
        this.validate(json);
        const key = SlideItem.genKeyByFileSource(fileSource, json.id);
        if (SlideItem._cache.has(key)) {
            return SlideItem._cache.get(key) as SlideItem;
        }
        return new SlideItem(json.id, json, fileSource);
    }
    static fromJsonError(json: anyObjectType, fileSource: FileSource) {
        const item = new SlideItem(-1, {
            metadata: {},
            canvasItems: [],
        }, fileSource);
        item.jsonError = json;
        return item;
    }
    toJson(): {
        id: number,
        canvasItems: anyObjectType[],
        metadata: anyObjectType,
    } {
        if (this.isError) {
            return this.jsonError;
        }
        return {
            id: this.id,
            canvasItems: this.canvasItemsJson,
            metadata: this.metadata,
        };
    }
    static validate(json: anyObjectType) {
        if (typeof json.id !== 'number' ||
            typeof json.metadata !== 'object' ||
            typeof json.metadata.width !== 'number' ||
            typeof json.metadata.height !== 'number' ||
            !(json.canvasItems instanceof Array)) {
            console.log(json);
            throw new Error('Invalid slide item data');
        }
        json.canvasItems.forEach((item: anyObjectType) => {
            canvasController.checkValidCanvasItem(item);
        });
    }
    clone(isDuplicateId?: boolean) {
        const slideItem = cloneObject(this);
        if (!isDuplicateId) {
            slideItem.id = -1;
        }
        return slideItem;
    }
    static genKeyByFileSource(fileSource: FileSource, id: number) {
        return `${fileSource.filePath}:${id}`;
    }
}
