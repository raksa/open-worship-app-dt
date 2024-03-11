import FileSource from '../helper/FileSource';
import { ItemBase } from '../helper/ItemBase';
// TODO: remove Slide
import { AnyObjectType, cloneJson } from '../helper/helpers';
import Canvas from '../slide-editor/canvas/Canvas';
import SlideListEventListener from '../event/SlideListEventListener';
import { CanvasItemPropsType } from '../slide-editor/canvas/CanvasItem';
import { DisplayType } from '../_present/presentHelpers';
import { PdfImageDataType } from '../pdf/PdfController';
import DragInf, { DragTypeEnum } from '../helper/DragInf';
import { log } from '../helper/loggerHelpers';

export type SlideItemType = {
    id: number,
    canvasItems: CanvasItemPropsType[],
    pdfImageData?: PdfImageDataType,
    metadata: AnyObjectType,
};

export default class SlideItem extends ItemBase implements DragInf<string> {
    _json: SlideItemType;
    static readonly SELECT_SETTING_NAME = 'slide-item-selected';
    id: number;
    filePath: string;
    isCopied: boolean;
    presentType: 'solo' | 'merge' = 'solo'; // TODO: implement this
    static copiedItem: SlideItem | null = null;
    private static _cache = new Map<string, SlideItem>();
    constructor(
        id: number, filePath: string, json: SlideItemType,
    ) {
        super();
        this.id = id;
        this._json = cloneJson(json);
        this.filePath = filePath;
        this.isCopied = false;
        SlideItem._cache.set(this.key, this);
    }
    get key() {
        return SlideItem.genKeyByFileSource(this.filePath, this.id);
    }
    get pdfImageData() {
        return this.originalJson.pdfImageData || null;
    }
    get isPdf() {
        return this.pdfImageData !== null;
    }
    get originalJson() {
        return this._json;
    }
    set originalJson(json: SlideItemType) {
        this._json = json;
        const items = this.editingHistoryManager.presentJson.items;
        const newItems = items.map((item) => {
            if (item.id === this.id) {
                return this.toJson();
            }
            return item;
        });
        this.editingHistoryManager.pushSlideItems(newItems);
    }
    get metadata() {
        return this.originalJson.metadata;
    }
    set metadata(metadata: AnyObjectType) {
        const json = cloneJson(this.originalJson);
        json.metadata = metadata;
        this.originalJson = json;
    }
    get pdfImageSrc() {
        return this.pdfImageData?.src || '';
    }
    get canvas() {
        return Canvas.fromJson({
            metadata: this.metadata,
            canvasItems: this.canvasItemsJson,
        });
    }
    set canvas(canvas: Canvas) {
        this.canvasItemsJson = canvas.canvasItems.map((item) => {
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
        if (this.isPdf) {
            return Math.floor(this.pdfImageData?.width || 0);
        }
        return this.metadata.width;
    }
    set width(width: number) {
        const metadata = this.metadata;
        metadata.width = width;
        this.metadata = metadata;
    }
    get height() {
        if (this.isPdf) {
            return Math.floor(this.pdfImageData?.height || 0);
        }
        return this.metadata.height;
    }
    set height(height: number) {
        const metadata = this.metadata;
        metadata.height = height;
        this.metadata = metadata;
    }
    get isSelected() {
        const selected = SlideItem.getSelectedResult();
        return selected?.filePath === this.filePath &&
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
        FileSource.getInstance(this.filePath).fireSelectEvent();
    }
    get isChanged() {
        return this.editingHistoryManager.checkIsSlideItemChanged(this.id);
    }
    static getSelectedEditingResult() {
        const selected = this.getSelectedResult();
        const selectedFilePath = Slide.getSelectedFilePath();
        if (selected?.filePath === selectedFilePath) {
            return selected;
        }
        return null;
    }
    static async getSelectedItem() {
        const selected = this.getSelectedEditingResult();
        if (selected !== null) {
            const slide = await Slide.readFileToData(selected.filePath);
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
    static fromJson(
        json: SlideItemType, filePath: string) {
        return new SlideItem(json.id, filePath, json);
    }
    static fromJsonError(json: AnyObjectType, filePath: string) {
        const newJson = {
            id: -1,
            metadata: {},
            canvasItems: [],
        };
        const item = new SlideItem(-1, filePath, newJson);
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
            pdfImageData: this.pdfImageData || undefined,
            metadata: this.metadata,
        };
    }
    static validate(json: AnyObjectType) {
        if (typeof json.id !== 'number' ||
            typeof json.metadata !== 'object' ||
            typeof json.metadata.width !== 'number' ||
            typeof json.metadata.height !== 'number' ||
            !(json.canvasItems instanceof Array)) {
            log(json);
            throw new Error('Invalid slide item data');
        }
    }
    clone(isDuplicateId?: boolean) {
        const slideItem = SlideItem.fromJson(this.toJson(), this.filePath);
        if (!isDuplicateId) {
            slideItem.id = -1;
        }
        return slideItem;
    }
    static async fromKey(key: string) {
        const extracted = this.extractKey(key);
        if (extracted === null) {
            return null;
        }
        const { filePath, id } = extracted;
        if (filePath === undefined || id === undefined) {
            return null;
        }
        const slide = await Slide.readFileToData(filePath);
        if (!slide) {
            return null;
        }
        return slide.getItemById(id);
    }
    static genKeyByFileSource(filePath: string, id: number) {
        return `${filePath}:${id}`;
    }
    static extractKey(key: string) {
        const [filePath, id] = key.split(':');
        if (filePath === undefined || id === undefined) {
            return null;
        }
        return {
            filePath,
            id: parseInt(id),
        };
    }
    static clearCache() {
        this._cache = new Map();
    }
    checkIsWrongDimension({ bounds }: DisplayType) {
        return bounds.width !== this.width ||
            bounds.height !== this.height;
    }
    dragSerialize() {
        return {
            type: DragTypeEnum.SLIDE_ITEM,
            data: this.key,
        };
    }
    static dragDeserialize(data: any) {
        return this.fromKey(data);
    }
}
