import SlideItem, { SlideItemType } from './SlideItem';
import ItemSource from '../helper/ItemSource';
import FileSource from '../helper/FileSource';
import { showAppContextMenu } from '../others/AppContextMenu';
import {
    checkIsPdf, openSlideContextMenu, readPdfToSlide, SlideDynamicType,
} from './slideHelpers';
import { AnyObjectType, toMaxId } from '../helper/helpers';
import Canvas from '../slide-editor/canvas/Canvas';
import SlideEditorCacheManager from './SlideEditorCacheManager';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { MimetypeNameType } from '../server/fileHelpers';
import { DisplayType } from '../_screen/screenHelpers';
import { PdfImageDataType } from '../pdf/PdfController';
import { showSimpleToast } from '../toast/toastHelpers';
import { createContext, use } from 'react';

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
    pdfImageDataList: PdfImageDataType[] | null = null;
    itemIdShouldToView = -1;
    constructor(filePath: string, json: SlideType) {
        super(filePath);
        this.editorCacheManager = new SlideEditorCacheManager(
            this.filePath, json,
        );
    }
    get isPdf() {
        return this.pdfImageDataList !== null;
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
            return (this.pdfImageDataList || []).map((pdfImageData, i) => {
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
            this.editorCacheManager.save();
        }
        return isSuccess;
    }

    fireNewItemsEvent() {
        this.fileSource.fireNewEvent(this.items);
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
        this.fireNewItemsEvent();
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
        this.fireNewItemsEvent();
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
        this.fireNewItemsEvent();
    }
    addItem(slideItem: SlideItem) {
        const items = this.items;
        slideItem.id = this.maxItemId + 1;
        items.push(slideItem);
        this.items = items;
        this.fireNewItemsEvent();
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
        this.items = newItems;
        this.fireNewItemsEvent();
    }

    static toWrongDimensionString({ slideItem, display }: {
        slideItem: { width: number, height: number },
        display: { width: number, height: number },
    }) {
        return (
            `⚠️ slide:${slideItem.width}x${slideItem.height} `
            + `display:${display.width}x${display.height}`
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
            menuTitle: 'Deselect',
            onClick: () => {
                this.isSelected = false;
            },
        }, {
            menuTitle: 'New Slide Item',
            onClick: () => {
                this.addNewItem();
            },
        }, {
            menuTitle: 'Paste',
            disabled: SlideItem.copiedItem === null,
            onClick: () => this.pasteItem(),
        }]);
    }
    async discardChanged() {
        this.editorCacheManager.delete();
    }
    static fromJson(filePath: string, json: any) {
        this.validate(json);
        return new Slide(filePath, json);
    }
    get isSelected() {
        const selectedFilePath = Slide.getSelectedFilePath();
        return this.filePath === selectedFilePath;
    }
    set isSelected(isSelected: boolean) {
        if (this.isSelected === isSelected) {
            return;
        }
        if (isSelected) {
            Slide.setSelectedFileSource(this.filePath);
            previewingEventListener.showSlide(this);
        } else {
            Slide.setSelectedFileSource(null);
            previewingEventListener.showSlide(null);
        }
        this.fileSource.fireSelectEvent();
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
    static slideItemExtractKey(key: string) {
        const [filePath, id] = key.split(':');
        if (filePath === undefined || id === undefined) {
            return null;
        }
        return {
            filePath,
            id: parseInt(id),
        };
    }
    static async slideItemFromKey(key: string) {
        const extracted = this.slideItemExtractKey(key);
        if (extracted === null) {
            return null;
        }
        const { filePath, id } = extracted;
        if (filePath === undefined || id === undefined) {
            return null;
        }
        const slide = await this.readFileToData(filePath);
        if (!slide) {
            return null;
        }
        return slide.getItemById(id);
    }
    static slideItemDragDeserialize(data: any) {
        return this.slideItemFromKey(data);
    }
    static async getSelectedSlide() {
        const selectedSlideFilePath = this.getSelectedFilePath();
        if (selectedSlideFilePath === null) {
            return null;
        }
        const slide = await this.readFileToData(selectedSlideFilePath);
        return slide || null;
    };
    static async getSelectedSlideItem() {
        const slide = await Slide.getSelectedSlide();
        if (!slide) {
            return null;
        }
        return slide.items[0];
    };
}

export const SelectedSlideContext = createContext<{
    selectedSlide: Slide | null,
    setSelectedSlide: (newSelectedSlide: Slide | null) => void,
} | null>(null);

function useContext() {
    const context = use(SelectedSlideContext);
    if (context === null) {
        throw new Error('useSelectedSlide must be used within a SlideProvider');
    }
    return context;
}

export function useSelectedSlideContext() {
    const context = useContext();
    if (context.selectedSlide === null) {
        throw new Error('No selected slide');
    }
    return context.selectedSlide;
}

export function useSelectedSlideSetterContext() {
    const context = useContext();
    return context.setSelectedSlide;
}
