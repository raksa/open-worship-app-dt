import SlideItem, { SlideItemType } from './SlideItem';
import ItemSource from '../helper/ItemSource';
import FileSource from '../helper/FileSource';
import { showAppContextMenu } from '../others/AppContextMenu';
import {
    checkIsPdf, MAX_THUMBNAIL_SCALE, MIN_THUMBNAIL_SCALE, openSlideContextMenu,
    readPdfToSlide, SlideDynamicType, THUMBNAIL_SCALE_STEP,
} from './slideHelpers';
import { AnyObjectType, toMaxId } from '../helper/helpers';
import Canvas from '../slide-editor/canvas/Canvas';
import SlideEditorCacheManager from './SlideEditorCacheManager';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { MimetypeNameType } from '../server/fileHelper';
import { DisplayType } from '../_screen/screenHelpers';
import { PdfImageDataType } from '../pdf/PdfController';
import { showSimpleToast } from '../toast/toastHelpers';

export type SlideEditorHistoryType = {
    items?: SlideItemType[],
    metadata?: AnyObjectType,
};

export type SlideType = {
    items: SlideItemType[],
    metadata: AnyObjectType,
};

export default class Slide extends ItemSource<SlideItem> {
    static readonly mimetype: MimetypeNameType = 'slide';
    static readonly SELECT_SETTING_NAME = 'slide-selected';
    SELECT_SETTING_NAME = 'slide-selected';
    editorCacheManager: SlideEditorCacheManager;
    _pdfImageDataList: PdfImageDataType[] | null = null;
    itemIdShouldToView = -1;
    constructor(filePath: string, json: SlideType) {
        super(filePath);
        this.editorCacheManager = new SlideEditorCacheManager(
            this.filePath, json,
        );
    }
    get isPdf() {
        return this._pdfImageDataList !== null;
    }
    get isChanged() {
        if (this.isPdf) {
            return false;
        }
        return this.editorCacheManager.isChanged;
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
        return this.editorCacheManager.presenterJson.metadata;
    }
    set metadata(metadata: AnyObjectType) {
        this.editorCacheManager.pushMetadata(metadata);
    }
    get items() {
        if (this.isPdf) {
            return (this._pdfImageDataList || []).map((pdfImageData, i) => {
                const slideItem = new SlideItem(i, this.filePath, {
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
        const latestHistory = this.editorCacheManager.presenterJson;
        return latestHistory.items.map((json) => {
            try {
                return SlideItem.fromJson(
                    json as any, this.filePath, this.editorCacheManager,
                );
            } catch (error: any) {
                showSimpleToast('Instantiating Bible Item', error.message);
            }
            return SlideItem.fromJsonError(json, this.filePath,
                this.editorCacheManager);
        });
    }
    set items(newItems: SlideItem[]) {
        const slideItems = newItems.map((item) => {
            return item.toJson();
        });
        this.editorCacheManager.pushSlideItems(slideItems);
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
            this.editorCacheManager.save();
        }
        return isSuccess;
    }
    duplicateItem(slideItem: SlideItem) {
        const items = this.items;
        const index = items.findIndex((item) => {
            return item.id === slideItem.id;
        });
        if (index === -1) {
            showSimpleToast('Duplicate Item', 'Unable to find item');
            return;
        }
        const newItem = slideItem.clone();
        if (newItem !== null) {
            newItem.id = this.maxItemId + 1;
            items.splice(index + 1, 0, newItem);
            this.itemIdShouldToView = newItem.id;
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
    moveItem(id: number, toIndex: number, isLeft: boolean) {
        const fromIndex: number = this.items.findIndex((item) => {
            return item.id === id;
        });
        if (fromIndex > toIndex && !isLeft) {
            toIndex++;
        }
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
    addNewItem() {
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
        const newItem = new SlideItem(item.id, this.filePath, json,
            this.editorCacheManager);
        this.itemIdShouldToView = newItem.id;
        this.addItem(newItem);
    }
    deleteItem(slideItem: SlideItem) {
        const newItems = this.items.filter((item) => {
            return item.id !== slideItem.id;
        });
        const result = SlideItem.getSelectedResult();
        if (result?.id === slideItem.id) {
            SlideItem.setSelected(null);
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
        this.editorCacheManager.pushSlideItems(newItemsJson);
    }
    showSlideItemContextMenu(event: any) {
        showAppContextMenu(event, [{
            title: 'Deselect',
            onClick: () => {
                this.isSelected = false;
            },
        }, {
            title: 'New Slide Item',
            onClick: () => {
                this.addNewItem();
            },
        }, {
            title: 'Paste',
            disabled: SlideItem.copiedItem === null,
            onClick: () => this.pasteItem(),
        }]);
    }
    async discardChanged() {
        this.editorCacheManager.delete();
        FileSource.getInstance(this.filePath).fireUpdateEvent();
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
    static fromJson(filePath: string, json: any) {
        this.validate(json);
        return new Slide(filePath, json);
    }
    get isSelected() {
        const selectedFilePath = Slide.getSelectedFilePath();
        return this.filePath === selectedFilePath;
    }
    set isSelected(b: boolean) {
        if (this.isSelected === b) {
            return;
        }
        if (b) {
            Slide.setSelectedFileSource(this.filePath);
            previewingEventListener.showSlide(this);
        } else {
            Slide.setSelectedFileSource(null);
            previewingEventListener.showSlide(null);
        }
        FileSource.getInstance(this.filePath).fireSelectEvent();
    }
    getItemById(id: number) {
        return this.items.find((item) => item.id === id) || null;
    }
    static async readFileToDataNoCache(filePath: string | null,
        isOrigin?: boolean) {
        if (filePath !== null) {
            const fileSource = FileSource.getInstance(filePath);
            if (fileSource.src && checkIsPdf(fileSource.extension)) {
                return readPdfToSlide(filePath);
            }
        }
        const data = await super.readFileToDataNoCache(filePath);
        const slide = data as SlideDynamicType;
        if (isOrigin && slide) {
            slide.editorCacheManager.isUsingHistory = false;
        }
        return slide;
    }
    static async readFileToData(filePath: string | null,
        isForceCache?: boolean) {
        const slide = super.readFileToData(filePath, isForceCache);
        return slide as Promise<Slide | undefined | null>;
    }
    static async getSelected() {
        const fileSource = this.getSelectedFilePath();
        if (fileSource !== null) {
            return this.readFileToData(fileSource);
        }
        return null;
    }
    static async getSelectedSlideItem() {
        let selectedSlideItem = await SlideItem.getSelected();
        if (selectedSlideItem === null) {
            const slide = await this.getSelected();
            if (slide) {
                const items = slide.items;
                if (items.length > 0) {
                    selectedSlideItem = items[0];
                }
            }
        }
        if (selectedSlideItem) {
            selectedSlideItem.isSelected = true;
            return selectedSlideItem;
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
        return Slide.fromJson(this.filePath, this.toJson());
    }
}
