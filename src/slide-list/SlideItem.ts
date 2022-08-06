import FileSource from '../helper/FileSource';
import { ItemBase } from '../helper/ItemBase';
import Slide from './Slide';
import { AnyObjectType, cloneObject } from '../helper/helpers';
import Canvas from '../slide-editor/canvas/Canvas';
import SlideEditingCacheManager from './SlideEditingCacheManager';
import { CanvasItemPropsType } from '../slide-editor/canvas/CanvasItem';
import SlideListEventListener from '../event/SlideListEventListener';

export type SlideItemType = {
    id: number,
    canvasItems: CanvasItemPropsType[],
    metadata: AnyObjectType,
};

export default class SlideItem extends ItemBase {
    _originalJson: Readonly<SlideItemType>;
    static SELECT_SETTING_NAME = 'slide-item-selected';
    id: number;
    fileSource: FileSource;
    isCopied: boolean;
    presentType: 'solo' | 'merge' = 'solo'; // TODO: implement this
    static copiedItem: SlideItem | null = null;
    editingCacheManager: SlideEditingCacheManager;
    _width: number;
    _height: number;
    static _cache = new Map<string, SlideItem>();
    constructor(id: number, fileSource: FileSource,
        json: SlideItemType,
        editingCacheManager?: SlideEditingCacheManager) {
        super();
        this.id = id;
        this._width = json.metadata.width;
        this._height = json.metadata.height;
        this._originalJson = Object.freeze(json);
        this.fileSource = fileSource;
        if (editingCacheManager !== undefined) {
            this.editingCacheManager = editingCacheManager;
        } else {
            this.editingCacheManager = new SlideEditingCacheManager(this.fileSource, {
                items: [json],
                metadata: {},
            });
            this.editingCacheManager.isUsingHistory = false;
        }
        this.isCopied = false;
        const key = SlideItem.genKeyByFileSource(fileSource, id);
        SlideItem._cache.set(key, this);
    }
    get metadata() {
        const json = this.editingCacheManager.getSlideItemById(this.id);
        return json?.metadata || this._originalJson.metadata;
    }
    set metadata(metadata: AnyObjectType) {
        this.editingCacheManager.pushMetadata(metadata);
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
    get canvasItemsJson() {
        const items = this.editingCacheManager.presentJson.items;
        const slideItemJson = items.find((item) => {
            return item.id === this.id;
        });
        return slideItemJson?.canvasItems ||
            this._originalJson.canvasItems;
    }
    set canvasItemsJson(canvasItemsJson: CanvasItemPropsType[]) {
        const items = this.editingCacheManager.presentJson.items;
        items.forEach((item) => {
            if (item.id === this.id) {
                item.canvasItems = canvasItemsJson;
            }
        });
        this.editingCacheManager.pushSlideItems(items);
    }
    get width() {
        return this._width;
    }
    set width(width: number) {
        this._width = width;
        const metadata = this.metadata;
        metadata.width = width;
        this.metadata = metadata;
    }
    get height() {
        return this._height;
    }
    set height(height: number) {
        this._height = height;
        const metadata = this.metadata;
        metadata.height = height;
        this.metadata = metadata;
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
            SlideListEventListener.selectSlideItem(this);
        } else {
            SlideItem.setSelectedItem(null);
            SlideListEventListener.selectSlideItem(null);
        }
        this.fileSource.fireSelectEvent();
    }
    get isChanged() {
        return this.editingCacheManager.checkIsSlideItemChanged(this.id);
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
    static fromJson(json: SlideItemType, fileSource: FileSource,
        editingCacheManager?: SlideEditingCacheManager) {
        const key = SlideItem.genKeyByFileSource(fileSource, json.id);
        if (SlideItem._cache.has(key)) {
            return SlideItem._cache.get(key) as SlideItem;
        }
        return new SlideItem(json.id, fileSource, json,
            editingCacheManager);
    }
    static fromJsonError(json: AnyObjectType,
        fileSource: FileSource,
        editingCacheManager?: SlideEditingCacheManager) {
        const item = new SlideItem(-1, fileSource, {
            id: -1,
            metadata: {},
            canvasItems: [],
        }, editingCacheManager);
        item.jsonError = json;
        return item;
    }
    toJson(): SlideItemType {
        if (this.isError) {
            return this.jsonError;
        }
        return {
            id: this.id,
            canvasItems: this.canvasItemsJson,
            metadata: this.metadata,
        };
    }
    static validate(json: AnyObjectType) {
        if (typeof json.id !== 'number' ||
            typeof json.metadata !== 'object' ||
            typeof json.metadata.width !== 'number' ||
            typeof json.metadata.height !== 'number' ||
            !(json.canvasItems instanceof Array)) {
            console.log(json);
            throw new Error('Invalid slide item data');
        }
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
    static clearCache() {
        this._cache = new Map();
    }
}
