import Slide, { SlideItemType } from './Slide';
import AppDocumentSourceAbs from '../helper/DocumentSourceAbs';
import { showAppContextMenu } from '../others/AppContextMenuComp';
import { showAppDocumentContextMenu } from './appDocumentHelpers';
import { AnyObjectType, toMaxId } from '../helper/helpers';
import Canvas from '../slide-editor/canvas/Canvas';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { MimetypeNameType } from '../server/fileHelpers';
import { DisplayType } from '../_screen/screenHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import EditingHistoryManager from '../others/EditingHistoryManager';
import ItemSourceInf from '../others/ItemSourceInf';
import { OptionalPromise } from '../others/otherHelpers';

export type SlideEditorHistoryType = {
    items?: SlideItemType[];
    metadata?: AnyObjectType;
};

export type AppDocumentType = {
    items: SlideItemType[];
    metadata: AnyObjectType;
};

export type WrongDimensionType = {
    slideItem: {
        width: number;
        height: number;
    };
    display: {
        width: number;
        height: number;
    };
};

export default class AppDocument
    extends AppDocumentSourceAbs
    implements ItemSourceInf<Slide>
{
    static readonly mimetypeName: MimetypeNameType = 'slide';
    static readonly SELECT_SETTING_NAME = 'slide-selected';
    SELECT_SETTING_NAME = 'slide-selected';
    itemIdShouldToView = -1;

    constructor(filePath: string) {
        super(filePath);
    }

    setItemById(_id: number, _item: Slide): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }

    get editingHistoryManager() {
        return EditingHistoryManager.getInstance(this.filePath);
    }

    async getJsonData() {
        const jsonText = await this.editingHistoryManager.getCurrentHistory();
        if (jsonText === null) {
            return {
                items: [],
                metadata: {},
            };
        }
        return JSON.parse(jsonText);
    }

    async setJsonData(jsonData: AppDocumentType) {
        const jsonString = AppDocument.toJsonString(jsonData);
        this.editingHistoryManager.addHistory(jsonString);
    }

    async getMetadata() {
        const jsonData = await this.getJsonData();
        return jsonData.metadata;
    }

    async setMetadata(metadata: AnyObjectType) {
        const jsonData = await this.getJsonData();
        jsonData.metadata = metadata;
        await this.setJsonData(jsonData);
    }

    async getItems() {
        const jsonData = await this.getJsonData();
        return jsonData.items.map((json: any) => {
            try {
                return Slide.fromJson(json, this.filePath);
            } catch (error: any) {
                showSimpleToast('Instantiating Bible Item', error.message);
            }
            return Slide.fromJsonError(json, this.filePath);
        }) as Slide[];
    }

    async setItems(newItems: Slide[]) {
        const jsonData = await this.getJsonData();
        jsonData.items = newItems.map((item) => item.toJson());
        await this.setJsonData(jsonData);
    }

    async getMaxItemId() {
        const items = await this.getItems();
        if (items.length) {
            const ids = items.map((item) => item.id);
            return toMaxId(ids);
        }
        return 0;
    }

    async getItemByIndex(index: number) {
        const items = await this.getItems();
        return items[index] || null;
    }

    async checkIsSlideItemChanged(id: number) {
        const newItem = await this.getItemById(id);
        const slideItems = await this.getItems();
        const originalItem = slideItems.find((item) => {
            return item.id === id;
        });
        return JSON.stringify(newItem) !== JSON.stringify(originalItem);
    }

    async duplicateItem(slideItem: Slide) {
        const items = await this.getItems();
        const index = items.findIndex((item) => {
            return item.checkIsSame(slideItem);
        });
        if (index === -1) {
            showSimpleToast('Duplicate Item', 'Unable to find item');
            return;
        }
        const newItem = slideItem.clone();
        if (newItem !== null) {
            const maxItemId = await this.getMaxItemId();
            newItem.id = maxItemId + 1;
            items.splice(index + 1, 0, newItem);
            this.itemIdShouldToView = newItem.id;
            await this.setItems(items);
            this.fileSource.fireNewEvent(newItem);
        }
    }

    async moveItem(id: number, toIndex: number, isLeft: boolean) {
        const items = await this.getItems();
        const fromIndex: number = items.findIndex((item) => {
            return item.id === id;
        });
        if (fromIndex > toIndex && !isLeft) {
            toIndex++;
        }
        const target = items.splice(fromIndex, 1)[0];
        items.splice(toIndex, 0, target);
        await this.setItems(items);
        this.fileSource.fireUpdateEvent(items);
    }

    async addItem(slideItem: Slide) {
        const items = await this.getItems();
        const maxItemId = await this.getMaxItemId();
        slideItem.id = maxItemId + 1;
        slideItem.filePath = this.filePath;
        items.push(slideItem);
        await this.setItems(items);
        this.fileSource.fireNewEvent(slideItem);
    }

    async addNewItem() {
        const maxItemId = await this.getMaxItemId();
        const item = Slide.defaultSlideItemData(maxItemId + 1);
        const { width, height } = Canvas.getDefaultDim();
        const json = {
            id: item.id,
            metadata: {
                width,
                height,
            },
            canvasItems: [], // TODO: add default canvas item
        };
        const newItem = new Slide(item.id, this.filePath, json);
        this.itemIdShouldToView = newItem.id;
        await this.addItem(newItem);
    }

    async deleteItem(slideItem: Slide) {
        const items = await this.getItems();
        const newItems = items.filter((item) => {
            return item.id !== slideItem.id;
        });
        await this.setItems(newItems);
        this.fileSource.fireDeleteEvent(slideItem);
    }

    static toWrongDimensionString({ slideItem, display }: WrongDimensionType) {
        return (
            `⚠️ slide:${slideItem.width}x${slideItem.height} ` +
            `display:${display.width}x${display.height}`
        );
    }

    async getIsWrongDimension(display: DisplayType) {
        const items = await this.getItems();
        const found = items.find((item) => {
            return item.checkIsWrongDimension(display);
        });
        if (found) {
            return {
                slideItem: found,
                display: {
                    width: display.bounds.width,
                    height: display.bounds.height,
                },
            } as WrongDimensionType;
        }
        return null;
    }

    async fixSlideDimension(display: DisplayType) {
        const items = await this.getItems();
        const newItemsJson = items.map((item) => {
            const json = item.toJson();
            if (item.checkIsWrongDimension(display)) {
                json.metadata.width = display.bounds.width;
                json.metadata.height = display.bounds.height;
            }
            return json;
        });
        const jsonString = AppDocument.toJsonString(newItemsJson);
        this.editingHistoryManager.addHistory(jsonString);
    }

    showItemContextMenu(event: any, slideItem: Slide) {
        showAppDocumentContextMenu(event, this, slideItem);
    }

    async showContextMenu(event: any) {
        const copiedSlideItems = await AppDocument.getCopiedSlideItems();
        showAppContextMenu(event, [
            {
                menuTitle: 'New Slide',
                onClick: () => {
                    this.addNewItem();
                },
            },
            ...(copiedSlideItems.length > 0
                ? [
                      {
                          menuTitle: 'Paste',
                          onClick: () => {
                              for (const copiedSlideItem of copiedSlideItems) {
                                  this.addItem(copiedSlideItem);
                              }
                          },
                      },
                  ]
                : []),
        ]);
    }

    get isSelected() {
        const selectedFilePath = AppDocument.getSelectedFilePath();
        return this.filePath === selectedFilePath;
    }

    set isSelected(isSelected: boolean) {
        if (this.isSelected === isSelected) {
            return;
        }
        if (isSelected) {
            AppDocument.setSelectedFileSource(this.filePath);
            previewingEventListener.showVaryAppDocument(this);
        } else {
            AppDocument.setSelectedFileSource(null);
            previewingEventListener.showVaryAppDocument(null);
        }
        this.fileSource.fireSelectEvent(this);
    }

    async getItemById(id: number) {
        const items = await this.getItems();
        return items.find((item) => item.id === id) || null;
    }

    static async create(dir: string, name: string) {
        return super.create(dir, name, [Slide.defaultSlideItemData(0)]);
    }

    static async getCopiedSlideItems() {
        const clipboardItems = await navigator.clipboard.read();
        const copiedSlideItems: Slide[] = [];
        const textPlainType = 'text/plain';
        for (const clipboardItem of clipboardItems) {
            if (
                clipboardItem.types.some((type) => {
                    return type === textPlainType;
                })
            ) {
                const blob = await clipboardItem.getType(textPlainType);
                const json = await blob.text();
                const copiedSlideItem = Slide.clipboardDeserialize(json);
                if (copiedSlideItem !== null) {
                    copiedSlideItems.push(copiedSlideItem);
                }
            }
        }
        return copiedSlideItems;
    }

    static toJsonString(jsonData: AnyObjectType) {
        return JSON.stringify(jsonData, null, 2);
    }

    static getInstance(filePath: string) {
        return this._getInstance(filePath, () => {
            return new AppDocument(filePath);
        });
    }

    static checkIsThisType(item: any) {
        return item instanceof this;
    }

    checkIsSame(varyAppDocument: any) {
        if (AppDocument.checkIsThisType(varyAppDocument)) {
            return this.filePath === varyAppDocument.filePath;
        }
    }
}
