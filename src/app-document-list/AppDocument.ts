import Slide, { SlideType } from './Slide';
import AppDocumentSourceAbs, {
    AppDocumentMetadataType,
} from '../helper/AppEditableDocumentSourceAbs';
import { showAppDocumentContextMenu } from './appDocumentHelpers';
import { AnyObjectType, checkIsSameValues, toMaxId } from '../helper/helpers';
import { MimetypeNameType } from '../server/fileHelpers';
import { DisplayType } from '../_screen/screenHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import EditingHistoryManager from '../editing-manager/EditingHistoryManager';
import ItemSourceInf from '../others/ItemSourceInf';
import { OptionalPromise } from '../others/otherHelpers';
import {
    ContextMenuItemType,
    showAppContextMenu,
} from '../context-menu/appContextMenuHelpers';

export type AppDocumentType = {
    metadata: AppDocumentMetadataType;
    items: SlideType[];
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
    extends AppDocumentSourceAbs<AppDocumentType>
    implements ItemSourceInf<Slide>
{
    static readonly mimetypeName: MimetypeNameType = 'slide';

    async getSlides() {
        let jsonData = await this.getJsonData();
        if (jsonData === null) {
            return [];
        }
        const slides = jsonData.items.map((json: any) => {
            try {
                return Slide.fromJson(json, this.filePath);
            } catch (error: any) {
                showSimpleToast('Instantiating Slide', error.message);
            }
            return Slide.fromJsonError(json, this.filePath);
        });
        jsonData = await this.getJsonData(true);
        if (jsonData !== null) {
            slides.forEach((slide, index) => {
                this.checkSlideIsChanged(index, slide, jsonData.items);
            });
        }
        return slides;
    }

    async setSlides(newSlides: Slide[]) {
        const jsonData = await this.getJsonData();
        if (jsonData === null) {
            return;
        }
        jsonData.items = newSlides.map((slide) => {
            return slide.toJson();
        });
        await this.setJsonData(jsonData);
    }

    async updateSlide(slide: Slide) {
        const slides = await this.getSlides();
        const index = slides.findIndex((slide1) => {
            return slide1.id === slide.id;
        });
        if (index === -1) {
            showSimpleToast('Set Slide', 'Unable to find a slide');
            return;
        }
        slides[index] = slide;
        await this.setSlides(slides);
    }

    async getSlideByIndex(index: number) {
        const slides = await this.getSlides();
        return slides[index] ?? null;
    }

    async getItemById(id: number) {
        const slides = await this.getSlides();
        return (
            slides.find((slide) => {
                return slide.id === id;
            }) ?? null
        );
    }

    setItemById(_id: number, _slide: Slide): OptionalPromise<void> {
        throw new Error('Method not implemented.');
    }

    get editingHistoryManager() {
        return EditingHistoryManager.getInstance(this.filePath);
    }

    async checkSlideIsChanged(
        index: number,
        slide: Slide,
        jsonItems: SlideType[],
    ) {
        const originalSlide = jsonItems[index];
        slide.isChanged =
            originalSlide === undefined ||
            !checkIsSameValues(slide.toJson(), originalSlide);
    }

    async getMaxSlideId() {
        const slides = await this.getSlides();
        if (slides.length) {
            const ids = slides.map((slide) => {
                return slide.id;
            });
            return toMaxId(ids);
        }
        return 0;
    }

    async duplicateSlide(slide: Slide) {
        const slides = await this.getSlides();
        const index = slides.findIndex((slide1) => {
            return slide1.checkIsSame(slide);
        });
        if (index === -1) {
            showSimpleToast('Duplicate Slide', 'Unable to find a slide');
            return;
        }
        const newSlide = slide.clone();
        if (newSlide !== null) {
            const maxSlideId = await this.getMaxSlideId();
            newSlide.id = maxSlideId + 1;
            slides.splice(index + 1, 0, newSlide);
            await this.setSlides(slides);
        }
    }

    async moveSlide(id: number, toIndex: number, isLeft: boolean) {
        const slides = await this.getSlides();
        const fromIndex: number = slides.findIndex((slide) => {
            return slide.id === id;
        });
        if (fromIndex > toIndex && !isLeft) {
            toIndex++;
        }
        const target = slides.splice(fromIndex, 1)[0];
        slides.splice(toIndex, 0, target);
        await this.setSlides(slides);
        this.fileSource.fireUpdateEvent(slides);
    }

    async addSlide(slide: Slide) {
        const slides = await this.getSlides();
        const maxSlideId = await this.getMaxSlideId();
        slide.id = maxSlideId + 1;
        slide.filePath = this.filePath;
        slides.push(slide);
        await this.setSlides(slides);
    }

    async addNewSlide() {
        const maxSlideId = await this.getMaxSlideId();
        const slide = Slide.defaultSlideData(maxSlideId + 1);
        const { width, height } = Slide.getDefaultDim();
        const json = {
            id: slide.id,
            metadata: {
                width,
                height,
            },
            canvasItems: [], // TODO: add default canvas item
        };
        const newSlide = new Slide(this.filePath, json);
        await this.addSlide(newSlide);
    }

    async deleteSlide(slide: Slide) {
        const slides = await this.getSlides();
        const newSlides = slides.filter((newSlide) => {
            return newSlide.id !== slide.id;
        });
        await this.setSlides(newSlides);
    }

    static toWrongDimensionString({ slide, display }: WrongDimensionType) {
        return (
            `⚠️ slide:${slide.width}x${slide.height} ` +
            `display:${display.width}x${display.height}`
        );
    }

    async getIsWrongDimension(display: DisplayType) {
        const slides = await this.getSlides();
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

    static validate(json: AnyObjectType): void {
        super.validate(json);
        if (typeof json.items !== 'object' || !Array.isArray(json.items)) {
            throw new Error(
                `Invalid app document data json:${JSON.stringify(json)}`,
            );
        }
        for (const item of json.items) {
            Slide.validate(item);
        }
    }

    async fixSlideDimension(display: DisplayType) {
        const slides = await this.getSlides();
        const newSlides = await Promise.all(
            slides.map((slide) => {
                return (async () => {
                    const json = slide.toJson();
                    if (slide.checkIsWrongDimension(display)) {
                        json.metadata.width = display.bounds.width;
                        json.metadata.height = display.bounds.height;
                    }
                    return Slide.fromJson(json, this.filePath);
                })();
            }),
        );
        await this.setSlides(newSlides);
    }

    showSlideContextMenu(
        event: any,
        slide: Slide,
        extraMenuItems: ContextMenuItemType[] = [],
    ) {
        showAppDocumentContextMenu(event, this, slide, extraMenuItems);
    }

    async showContextMenu(event: any) {
        const copiedSlides = await AppDocument.getCopiedSlides();
        showAppContextMenu(event, [
            {
                menuElement: 'New Slide',
                onSelect: () => {
                    this.addNewSlide();
                },
            },
            ...(copiedSlides.length > 0
                ? [
                      {
                          menuElement: 'Paste',
                          onSelect: () => {
                              for (const copiedSlide of copiedSlides) {
                                  this.addSlide(copiedSlide);
                              }
                          },
                      },
                  ]
                : []),
        ]);
    }

    static async create(dir: string, name: string) {
        return super.create(dir, name, { items: [Slide.defaultSlideData(0)] });
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

    static getInstance(filePath: string) {
        return this._getInstance(filePath, () => {
            return new this(filePath);
        });
    }
}
