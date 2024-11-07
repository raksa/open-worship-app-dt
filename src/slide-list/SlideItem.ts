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
    static readonly SELECT_SETTING_NAME = 'slide-item-selected';
    id: number;
    filePath: string;
    presentType: 'solo' | 'merge' = 'solo'; // TODO: implement this
    static copiedSlideItemKey: string | null = null;
    constructor(id: number, filePath: string) {
        super();
        this.id = id;
        this.filePath = filePath;
    }
    static filePathToKey(filePath: string, id: number) {
        return `${filePath}:${id}`;
    }
    get key() {
        return SlideItem.filePathToKey(this.filePath, this.id);
    }
    static extractKey(key: string) {
        const [filePath, id] = key.split(':');
        if (filePath === undefined || id === undefined) {
            return null;
        }
        return { filePath, id: parseInt(id) };
    }
    async getJsonData() {
        // TODO: implement this
        return {
            id: this.id,
            canvasItems: [],
            pdfImageData: { src: '', width: 0, height: 0 },
            metadata: {},
        };
    }
    async setJsonData(json: SlideItemType) {
        // TODO: implement this
    }
    async getPdfImageData() {
        return (await this.getJsonData()).pdfImageData || null;
    }
    async checkIsPdf() {
        return await this.getPdfImageData() !== null;
    }
    async getMetadata() {
        return (await this.getJsonData()).metadata;
    }
    async getPdfImageSrc() {
        return (await this.getPdfImageData())?.src || '';
    }
    async getCanvas() {
        return Canvas.fromJson({
            metadata: await this.getMetadata(),
            canvasItems: await this.getCanvasItemsJson(),
        });
    }
    async getCanvasItemsJson() {
        return (await this.getJsonData()).canvasItems;
    }
    async setCanvasItemsJson(canvasItemsJson: CanvasItemPropsType[]) {
        const json = cloneJson(await this.getJsonData()) as any;
        json.canvasItems = canvasItemsJson;
        // TODO: implement this
    }
    async getWidth() {
        if (await this.checkIsPdf()) {
            return Math.floor((await this.getPdfImageData())?.width || 0);
        }
        return (await this.getMetadata()).width;
    }
    async getHeight() {
        if (await this.checkIsPdf()) {
            return Math.floor((await this.getPdfImageData())?.height || 0);
        }
        return (await this.getMetadata()).height;
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
    async checkIsWrongDimension({ bounds }: DisplayType) {
        return (
            bounds.width !== await this.getWidth() ||
            bounds.height !== await this.getHeight()
        );
    }
    dragSerialize() {
        return {
            type: DragTypeEnum.SLIDE_ITEM,
            data: this.key,
        };
    }
}
