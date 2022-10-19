import FileSource from '../helper/FileSource';
import { ItemBase } from '../helper/ItemBase';
import Slide from './Slide';
import { AnyObjectType, cloneJson } from '../helper/helpers';
import Canvas from '../slide-editor/canvas/Canvas';
import SlideEditingCacheManager from './SlideEditingCacheManager';
import SlideListEventListener from '../event/SlideListEventListener';
import { CanvasItemPropsType } from '../slide-editor/canvas/CanvasItem';

export type SlideItemType = {
    id: number,
    canvasItems: CanvasItemPropsType[],
    metadata: AnyObjectType,
};

export default class SlideItem extends ItemBase {
    _json: SlideItemType;
    static SELECT_SETTING_NAME = 'slide-item-selected';
    id: number;
    fileSource: FileSource;
    isCopied: boolean;
    presentType: 'solo' | 'merge' = 'solo'; // TODO: implement this
    static copiedItem: SlideItem | null = null;
    editingCacheManager: SlideEditingCacheManager;
    static _cache = new Map<string, SlideItem>();
    constructor(id: number, fileSource: FileSource,
        json: SlideItemType,
        editingCacheManager?: SlideEditingCacheManager) {
        super();
        this.id = id;
        this._json = cloneJson(json);
        this.fileSource = fileSource;
        if (editingCacheManager !== undefined) {
            this.editingCacheManager = editingCacheManager;
        } else {
            this.editingCacheManager = new SlideEditingCacheManager(
                this.fileSource, {
                items: [json],
                metadata: {},
            });
            this.editingCacheManager.isUsingHistory = false;
        }
        this.isCopied = false;
        const key = SlideItem.genKeyByFileSource(fileSource, id);
        SlideItem._cache.set(key, this);
    }
    get originalJson() {
        return this._json;
    }
    set originalJson(json: SlideItemType) {
        this._json = json;
        const items = this.editingCacheManager.presentJson.items;
        const newItems = items.map((item) => {
            if (item.id === this.id) {
                return this.toJson();
            }
            return item;
        });
        this.editingCacheManager.pushSlideItems(newItems);
    }
    get metadata() {
        return this.originalJson.metadata;
    }
    set metadata(metadata: AnyObjectType) {
        const json = cloneJson(this.originalJson);
        json.metadata = metadata;
        this.originalJson = json;
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
        return this.originalJson.canvasItems;
    }
    set canvasItemsJson(canvasItemsJson: CanvasItemPropsType[]) {
        const json = cloneJson(this.originalJson);
        json.canvasItems = canvasItemsJson;
        this.originalJson = json;
    }
    get width() {
        return this.metadata.width;
    }
    set width(width: number) {
        const metadata = this.metadata;
        metadata.width = width;
        this.metadata = metadata;
    }
    get height() {
        return this.metadata.height;
    }
    set height(height: number) {
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
        const newJson = {
            id: -1,
            metadata: {},
            canvasItems: [],
        };
        const item = new SlideItem(-1, fileSource, newJson,
            editingCacheManager);
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
        const slideItem = SlideItem.fromJson(this.toJson(), this.fileSource);
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
