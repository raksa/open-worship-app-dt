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
import { previewingEventListener } from '../event/PreviewingEventListener';
import { MimetypeNameType } from '../server/fileHelper';
import { DisplayType } from '../_present/presentHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import EditingHistoryManager from '../others/EditingHistoryManager';

export type SlideType = {
    items: SlideItemType[],
    metadata: AnyObjectType,
};

export default class Slide extends ItemSource<SlideItem> {
    static readonly mimetype: MimetypeNameType = 'slide';
    static readonly SELECT_SETTING_NAME = 'slide-selected';
    SELECT_SETTING_NAME = 'slide-selected';
    itemIdShouldToView = -1;
    constructor(filePath: string) {
        super(filePath);
    }
    get editingHistoryManager() {
        return new EditingHistoryManager(this.filePath);
    }
    get isPdf() {
        // TODO: check is PDF by ext
        return false;
    }
    async getJson(): Promise<SlideType> {
        // this.validate(json);
        return {
            items: [],
            metadata: {},
        };
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
    async getMetadata() {
        if (this.isPdf) {
            return {};
        }
        const slideJson = await this.getJson();
        return slideJson.metadata;
    }
    async setMetadata(metadata: AnyObjectType) {
        const slideJson = await this.getJson();
        slideJson.metadata = metadata;
        this.save(slideJson);
    }
    set items(newItems: SlideItem[]) {
        const slideItems = newItems.map((item) => {
            return item.toJson();
        });
        this._slideJson.items = slideItems;
        this.addHistory();
    }
    get maxItemId() {
        if (this.items.length) {
            const ids = this.items.map((item) => item.id);
            return toMaxId(ids);
        }
        return 0;
    }
    addHistory() {
        return this.editingHistoryManager.addHistory(
            JSON.stringify(this._slideJson),
        );
    }
    getItemByIndex(index: number) {
        return this.items[index] || null;
    }
    duplicateItem(slideItemId: number) {
        const items = this.items;
        const index = items.findIndex((item) => {
            return item.id === slideItemId;
        });
        if (index === -1) {
            showSimpleToast('Duplicate Item', 'Unable to find item');
            return;
        }
        const newItem = items[index].clone();
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
        const newItem = new SlideItem(item.id, this.filePath, json);
        this.itemIdShouldToView = newItem.id;
        this.addItem(newItem);
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
    private async applyHistory(isHistoryChanged: boolean) {
        if (!isHistoryChanged) {
            return false;
        }
        const newSlide = await Slide.readFileToDataNoCache(this.filePath);
        if (!newSlide) {
            return false;
        }
        this.items = newSlide.items;
        this.metadata = newSlide.metadata;
        return true;
    }
    async undo() {
        const isUndoDone = await this.editingHistoryManager.undo();
        return await this.applyHistory(isUndoDone);
    }
    async redo() {
        const isRedoDone = await this.editingHistoryManager.redo();
        return await this.applyHistory(isRedoDone);
    }
    static toWrongDimensionString({ slideItem, display }: {
        slideItem: { width: number, height: number },
        display: { width: number, height: number },
    }) {
        return (
            `⚠️ slide:${slideItem.width}x${slideItem.height} ` +
            `display:${display.width}x${display.height}`
        );
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
        const newItems = this.items.map((item) => {
            const json = item.toJson();
            if (item.checkIsWrongDimension(display)) {
                json.metadata.width = display.bounds.width;
                json.metadata.height = display.bounds.height;
            }
            return item;
        });
        this.items = newItems;
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
        this.editingHistoryManager.discard();
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
    static fromJson(filePath: string) {
        return new Slide(filePath);
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
            previewingEventListener.presentSlide(this);
        } else {
            Slide.setSelectedFileSource(null);
            previewingEventListener.presentSlide(null);
        }
        FileSource.getInstance(this.filePath).fireSelectEvent();
    }
    getItemById(id: number) {
        return this.items.find((item) => item.id === id) || null;
    }
    static async readFileToDataNoCache(filePath: string | null) {
        if (filePath !== null) {
            const fileSource = FileSource.getInstance(filePath);
            if (fileSource.src && checkIsPdf(fileSource.extension)) {
                return readPdfToSlide(filePath);
            }
            try {
                return this.fromJson(filePath);
            } catch (error: any) {
                showSimpleToast('Instantiating Data', error.message);
            }
        }
        const data = await super.readFileToDataNoCache(filePath);
        const slide = data as SlideDynamicType;
        return slide;
    }
    static async readFileToData(
        filePath: string | null, isForceCache?: boolean,
    ) {
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
        return Slide.fromJson(this.filePath);
    }
    async delete() {
        await this.editingHistoryManager.discard();
        const fileSource = FileSource.getInstance(this.filePath);
        await fileSource.delete();
        fileSource.fireUpdateEvent();
        fileSource.fireHistoryUpdateEvent();
    }
    static getSelectedSlideItemEditingResult() {
        const selected = SlideItem.getSelectedResult();
        const selectedFilePath = Slide.getSelectedFilePath();
        if (selected?.filePath === selectedFilePath) {
            return selected;
        }
        return null;
    }
    static async getSelectedSlideItem() {
        const selected = this.getSelectedSlideItemEditingResult();
        if (selected !== null) {
            const slide = await Slide.readFileToData(selected.filePath);
            return slide?.getItemById(selected.id);
        }
        return null;
    }
    static async slideItemFromKey(key: string) {
        const extracted = SlideItem.extractKey(key);
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
    static slideItemDragDeserialize(data: any) {
        return this.slideItemFromKey(data);
    }
}
