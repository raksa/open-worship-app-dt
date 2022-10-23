import SlideItem, { SlideItemType } from './SlideItem';
import ItemSource from '../helper/ItemSource';
import FileSource from '../helper/FileSource';
import { showAppContextMenu } from '../others/AppContextMenu';
import {
    checkIsPdf,
    MAX_THUMBNAIL_SCALE,
    MIN_THUMBNAIL_SCALE,
    openSlideContextMenu,
    readPdfToSlide,
    SlideDynamicType,
    THUMBNAIL_SCALE_STEP,
} from './slideHelpers';
import { AnyObjectType, toMaxId } from '../helper/helpers';
import Canvas from '../slide-editor/canvas/Canvas';
import ToastEventListener from '../event/ToastEventListener';
import SlideEditingCacheManager from './SlideEditingCacheManager';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { MimetypeNameType } from '../server/fileHelper';
import { DisplayType } from '../_present/presentHelpers';
import { PdfImageDataType } from '../pdf/PdfController';

export type SlideEditingHistoryType = {
    items?: SlideItemType[],
    metadata?: AnyObjectType,
};

export type SlideType = {
    items: SlideItemType[],
    metadata: AnyObjectType,
};

export default class Slide extends ItemSource<SlideItem>{
    static mimetype: MimetypeNameType = 'slide';
    static SELECT_SETTING_NAME = 'slide-selected';
    SELECT_SETTING_NAME = 'slide-selected';
    editingCacheManager: SlideEditingCacheManager;
    _pdfImageDataList: PdfImageDataType[] | null = null;
    constructor(fileSource: FileSource, json: SlideType) {
        super(fileSource);
        this.editingCacheManager = new SlideEditingCacheManager(
            this.fileSource, json);
    }
    get isPdf() {
        return this._pdfImageDataList !== null;
    }
    get isChanged() {
        if (this.isPdf) {
            return false;
        }
        return this.editingCacheManager.isChanged;
    }
    get copiedItem() {
        return this.items.find((item) => {
            return item.isCopied;
        }) || null;
    }
    set copiedItem(newItem: SlideItem | null) {
        this.items.forEach((item) => {
            item.isCopied = false;
        });
        if (newItem !== null) {
            newItem.isCopied = true;
        }
    }
    get selectedIndex() {
        const foundItem = this.items.find((item) => {
            return item.isSelected;
        }) || null;
        if (foundItem) {
            return this.items.indexOf(foundItem);
        }
        return -1;
    }
    set selectedIndex(newIndex: number) {
        this.items.forEach((item) => {
            item.isSelected = false;
        });
        if (this.items[newIndex]) {
            this.items[newIndex].isSelected = true;
        }
    }
    get metadata() {
        if (this.isPdf) {
            return {};
        }
        return this.editingCacheManager.presentJson.metadata;
    }
    set metadata(metadata: AnyObjectType) {
        this.editingCacheManager.pushMetadata(metadata);
    }
    get items() {
        if (this.isPdf) {
            return (this._pdfImageDataList || []).map((pdfImageData, i) => {
                const slideItem = new SlideItem(i, this.fileSource, {
                    id: i,
                    canvasItems: [],
                    pdfImageData,
                    metadata: {
                        width: pdfImageData.width,
                        height: pdfImageData.height,
                    },
                });
                return slideItem;
            });
        }
        const latestHistory = this.editingCacheManager.presentJson;
        return latestHistory.items.map((json) => {
            try {
                return SlideItem.fromJson(json as any,
                    this.fileSource, this.editingCacheManager);
            } catch (error: any) {
                ToastEventListener.showSimpleToast({
                    title: 'Instantiating Bible Item',
                    message: error.message,
                });
            }
            return SlideItem.fromJsonError(json, this.fileSource,
                this.editingCacheManager);
        });
    }
    set items(newItems: SlideItem[]) {
        const slideItems = newItems.map((item) => {
            return item.toJson();
        });
        this.editingCacheManager.pushSlideItems(slideItems);
    }
    get maxItemId() {
        if (this.items.length) {
            const ids = this.items.map((item) => item.id);
            return toMaxId(ids);
        }
        return 0;
    }
    getItemByIndex(index: number) {
        return this.items[index] || null;
    }
    async save(): Promise<boolean> {
        const isSuccess = await super.save();
        if (isSuccess) {
            SlideItem.clearCache();
            this.editingCacheManager.save();
        }
        return isSuccess;
    }
    duplicateItem(slideItem: SlideItem) {
        const items = this.items;
        const newItem = slideItem.clone();
        if (newItem !== null) {
            newItem.id = this.maxItemId + 1;
            const index = this.items.indexOf(slideItem);
            items.splice(index + 1, 0, newItem);
            this.items = items;
        }
    }
    pasteItem() {
        if (this.copiedItem === null) {
            return;
        }
        const newItem = this.copiedItem.clone();
        if (newItem !== null) {
            newItem.id = this.maxItemId + 1;
            const newItems: SlideItem[] = [...this.items, newItem];
            this.items = newItems;
        }
    }
    moveItem(id: number, toIndex: number) {
        const fromIndex: number = this.items.findIndex((item) => {
            return item.id === id;
        });
        const items = this.items;
        const target = items.splice(fromIndex, 1)[0];
        items.splice(toIndex, 0, target);
        this.items = items;
    }
    addItem(slideItem: SlideItem) {
        const items = this.items;
        slideItem.id = this.maxItemId + 1;
        items.push(slideItem);
        this.items = items;
    }
    deleteItem(slideItem: SlideItem) {
        const newItems = this.items.filter((item) => {
            return item.id !== slideItem.id;
        });
        const result = SlideItem.getSelectedResult();
        if (result?.id === slideItem.id) {
            SlideItem.setSelectedItem(null);
        }
        this.items = newItems;
    }
    static toWrongDimensionString({ slideItem, display }: {
        slideItem: { width: number, height: number },
        display: { width: number, height: number },
    }) {
        return `⚠️ slide:${slideItem.width}x${slideItem.height} `
            + `display:${display.width}x${display.height}`;
    }
    checkIsWrongDimension(display: DisplayType) {
        const found = this.items.find((item) => {
            return item.checkIsWrongDimension(display);
        });
        if (found) {
            return {
                slideItem: found,
                display: {
                    width: display.bounds.width,
                    height: display.bounds.height,
                },
            };
        }
        return null;
    }
    async fixSlideDimension(display: DisplayType) {
        const newItemsJson = this.items.map((item) => {
            const json = item.toJson();
            if (item.checkIsWrongDimension(display)) {
                json.metadata.width = display.bounds.width;
                json.metadata.height = display.bounds.height;
            }
            return json;
        });
        this.editingCacheManager.pushSlideItems(newItemsJson);
    }
    showSlideItemContextMenu(event: any) {
        showAppContextMenu(event, [{
            title: 'New Slide Item',
            onClick: () => {
                const item = SlideItem.defaultSlideItemData(this.maxItemId + 1);
                const { width, height } = Canvas.getDefaultDim();
                const json = {
                    id: item.id,
                    metadata: {
                        width,
                        height,
                    },
                    canvasItems: [], // TODO: add default canvas item
                };
                const newItem = new SlideItem(item.id, this.fileSource, json,
                    this.editingCacheManager);
                this.addItem(newItem);
            },
        }, {
            title: 'Paste',
            disabled: SlideItem.copiedItem === null,
            onClick: () => this.pasteItem(),
        }]);
    }
    async discardChanged() {
        this.editingCacheManager.delete();
        this.fileSource.fireUpdateEvent();
    }
    static toScaleThumbSize(isUp: boolean, currentScale: number) {
        let newScale = currentScale + (isUp ? -1 : 1) * THUMBNAIL_SCALE_STEP;
        if (newScale < MIN_THUMBNAIL_SCALE) {
            newScale = MIN_THUMBNAIL_SCALE;
        }
        if (newScale > MAX_THUMBNAIL_SCALE) {
            newScale = MAX_THUMBNAIL_SCALE;
        }
        return newScale;
    }
    static fromJson(fileSource: FileSource, json: any) {
        this.validate(json);
        return new Slide(fileSource, json);
    }
    get isSelected() {
        const selectedFS = Slide.getSelectedFileSource();
        return this.fileSource.filePath === selectedFS?.filePath;
    }
    set isSelected(b: boolean) {
        if (this.isSelected === b) {
            return;
        }
        if (b) {
            Slide.setSelectedFileSource(this.fileSource);
            previewingEventListener.presentSlide(this);
        } else {
            Slide.setSelectedFileSource(null);
            previewingEventListener.presentSlide(null);
        }
        this.fileSource.fireSelectEvent();
    }
    getItemById(id: number) {
        return this.items.find((item) => item.id === id) || null;
    }
    static async readFileToDataNoCache(fileSource: FileSource | null,
        isOrigin?: boolean) {
        if (fileSource?.src && checkIsPdf(fileSource.extension)) {
            return readPdfToSlide(fileSource);
        }
        const data = await super.readFileToDataNoCache(fileSource);
        const slide = data as SlideDynamicType;
        if (isOrigin && slide) {
            slide.editingCacheManager.isUsingHistory = false;
        }
        return slide;
    }
    static async readFileToData(fileSource: FileSource | null,
        isForceCache?: boolean) {
        const slide = super.readFileToData(fileSource, isForceCache);
        return slide as Promise<Slide | undefined | null>;
    }
    static async getSelected() {
        const fileSource = this.getSelectedFileSource();
        if (fileSource !== null) {
            return this.readFileToData(fileSource);
        }
        return null;
    }
    static async create(dir: string, name: string) {
        return super.create(dir, name,
            [SlideItem.defaultSlideItemData(0)]);
    }
    openContextMenu(event: any, slideItem: SlideItem) {
        if (this.isPdf) {
            event.stopPropagation();
            return;
        }
        openSlideContextMenu(event, this, slideItem);
    }
    clone() {
        return Slide.fromJson(this.fileSource, this.toJson());
    }
}
