import Slide, { SlideType } from './Slide';
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

export type AppDocumentType = {
    items: SlideType[];
    metadata: AnyObjectType;
};

export type WrongDimensionType = {
    slide: {
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

    constructor(filePath: string) {
        super(filePath);
    }

    setItemById(_id: number, _slide: Slide): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }

    get editingHistoryManager() {
        return EditingHistoryManager.getInstance(this.filePath);
    }

    async getJsonData(): Promise<AppDocumentType> {
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
        });
    }

    async setItems(newItems: Slide[]) {
        const jsonData = await this.getJsonData();
        jsonData.items = newItems.map((item) => item.toJson());
        await this.setJsonData(jsonData);
    }

    async getMaxItemId() {
        const slides = await this.getItems();
        if (slides.length) {
            const ids = slides.map((slide) => {
                return slide.id;
            });
            return toMaxId(ids);
        }
        return 0;
    }

    async getItemByIndex(index: number) {
        const slides = await this.getItems();
        return slides[index] || null;
    }

    async checkIsSlideChanged(id: number) {
        const newSlide = await this.getItemById(id);
        const slides = await this.getItems();
        const originalSlide = slides.find((slide) => {
            return slide.id === id;
        });
        return JSON.stringify(newSlide) !== JSON.stringify(originalSlide);
    }

    async duplicateSlide(slide: Slide) {
        const slides = await this.getItems();
        const index = slides.findIndex((slide) => {
            return slide.checkIsSame(slide);
        });
        if (index === -1) {
            showSimpleToast('Duplicate Slide', 'Unable to find a slide');
            return;
        }
        const newSlide = slide.clone();
        if (newSlide !== null) {
            const maxSlideId = await this.getMaxItemId();
            newSlide.id = maxSlideId + 1;
            slides.splice(index + 1, 0, newSlide);
            await this.setItems(slides);
            this.fileSource.fireNewEvent(newSlide);
        }
    }

    async moveSlide(id: number, toIndex: number, isLeft: boolean) {
        const slides = await this.getItems();
        const fromIndex: number = slides.findIndex((slide) => {
            return slide.id === id;
        });
        if (fromIndex > toIndex && !isLeft) {
            toIndex++;
        }
        const target = slides.splice(fromIndex, 1)[0];
        slides.splice(toIndex, 0, target);
        await this.setItems(slides);
        this.fileSource.fireUpdateEvent(slides);
    }

    async addSlide(slide: Slide) {
        const slides = await this.getItems();
        const maxSlideId = await this.getMaxItemId();
        slide.id = maxSlideId + 1;
        slide.filePath = this.filePath;
        slides.push(slide);
        await this.setItems(slides);
        this.fileSource.fireNewEvent(slide);
    }

    async addNewSlide() {
        const maxSlideId = await this.getMaxItemId();
        const slide = Slide.defaultSlideData(maxSlideId + 1);
        const { width, height } = Canvas.getDefaultDim();
        const json = {
            id: slide.id,
            metadata: {
                width,
                height,
            },
            canvasItems: [], // TODO: add default canvas item
        };
        const newSlide = new Slide(slide.id, this.filePath, json);
        await this.addSlide(newSlide);
    }

    async deleteSlide(slide: Slide) {
        const slides = await this.getItems();
        const newSlides = slides.filter((newSlide) => {
            return newSlide.id !== slide.id;
        });
        await this.setItems(newSlides);
        this.fileSource.fireDeleteEvent(slide);
    }

    static toWrongDimensionString({ slide, display }: WrongDimensionType) {
        return (
            `⚠️ slide:${slide.width}x${slide.height} ` +
            `display:${display.width}x${display.height}`
        );
    }

    async getIsWrongDimension(display: DisplayType) {
        const slides = await this.getItems();
        const foundSlide = slides.find((slide) => {
            return slide.checkIsWrongDimension(display);
        });
        if (foundSlide) {
            return {
                slide: foundSlide,
                display: {
                    width: display.bounds.width,
                    height: display.bounds.height,
                },
            } as WrongDimensionType;
        }
        return null;
    }

    async fixSlideDimension(display: DisplayType) {
        const slides = await this.getItems();
        const newSlidesJson = slides.map((slide) => {
            const json = slide.toJson();
            if (slide.checkIsWrongDimension(display)) {
                json.metadata.width = display.bounds.width;
                json.metadata.height = display.bounds.height;
            }
            return json;
        });
        const jsonString = AppDocument.toJsonString(newSlidesJson);
        this.editingHistoryManager.addHistory(jsonString);
    }

    showItemContextMenu(event: any, slide: Slide) {
        showAppDocumentContextMenu(event, this, slide);
    }

    async showContextMenu(event: any) {
        const copiedSlides = await AppDocument.getCopiedSlides();
        showAppContextMenu(event, [
            {
                menuTitle: 'New Slide',
                onClick: () => {
                    this.addNewSlide();
                },
            },
            ...(copiedSlides.length > 0
                ? [
                      {
                          menuTitle: 'Paste',
                          onClick: () => {
                              for (const copiedSlide of copiedSlides) {
                                  this.addSlide(copiedSlide);
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
        const slides = await this.getItems();
        return (
            slides.find((slide) => {
                return slide.id === id;
            }) || null
        );
    }

    static async create(dir: string, name: string) {
        return super.create(dir, name, [Slide.defaultSlideData(0)]);
    }

    static async getCopiedSlides() {
        const clipboardSlides = await navigator.clipboard.read();
        const copiedSlides: Slide[] = [];
        const textPlainType = 'text/plain';
        for (const clipboardSlide of clipboardSlides) {
            if (
                clipboardSlide.types.some((type) => {
                    return type === textPlainType;
                })
            ) {
                const blob = await clipboardSlide.getType(textPlainType);
                const json = await blob.text();
                const copiedSlideSlide = Slide.clipboardDeserialize(json);
                if (copiedSlideSlide !== null) {
                    copiedSlides.push(copiedSlideSlide);
                }
            }
        }
        return copiedSlides;
    }

    static toJsonString(jsonData: AnyObjectType) {
        return JSON.stringify(jsonData, null, 2);
    }

    static getInstance(filePath: string) {
        return this._getInstance(filePath, () => {
            return new AppDocument(filePath);
        });
    }

    static checkIsThisType(varyAppDocument: any) {
        return varyAppDocument instanceof this;
    }

    checkIsSame(varyAppDocument: any) {
        if (AppDocument.checkIsThisType(varyAppDocument)) {
            return this.filePath === varyAppDocument.filePath;
        }
    }
}
