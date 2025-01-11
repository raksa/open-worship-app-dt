import { ItemBase } from '../helper/ItemBase';
import { AnyObjectType, cloneJson } from '../helper/helpers';
import DragInf, { DragTypeEnum } from '../helper/DragInf';
import { log } from '../helper/loggerHelpers';
import { ClipboardInf, toKeyByFilePath } from './appDocumentHelpers';

export type PDFSlideType = {
    id: number;
    imagePreviewSrc: string;
    pdfPageNumber: number;
    metadata: { width: number; height: number };
};

export default class PDFSlide
    extends ItemBase
    implements DragInf<string>, ClipboardInf
{
    private _originalJson: PDFSlideType;
    static readonly SELECT_SETTING_NAME = 'slide-item-selected';
    id: number;
    filePath: string;

    constructor(id: number, filePath: string, json: PDFSlideType) {
        super();
        this.id = id;
        this._originalJson = cloneJson(json);
        this.filePath = filePath;
    }

    clone(): ItemBase {
        throw new Error('Method not implemented.');
    }

    get pdfPreviewSrc() {
        return this.originalJson.imagePreviewSrc ?? null;
    }

    get key() {
        return toKeyByFilePath(this.filePath, this.id);
    }

    get originalJson() {
        return this._originalJson;
    }

    set originalJson(json: PDFSlideType) {
        this._originalJson = json;
    }

    checkIsSame(item: any) {
        if (PDFSlide.checkIsThisType(item)) {
            return this.id === item.id;
        }
        return false;
    }

    get metadata() {
        return this.originalJson.metadata;
    }

    get width() {
        return this.metadata.width;
    }

    get height() {
        return this.metadata.height;
    }

    static fromJson(json: PDFSlideType, filePath: string) {
        return new PDFSlide(json.id, filePath, json);
    }

    toJson(): PDFSlideType {
        return this._originalJson;
    }

    static tryValidate(json: AnyObjectType) {
        try {
            this.validate(json);
            return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {}
        return false;
    }

    static validate(json: AnyObjectType) {
        if (
            typeof json.id !== 'number' ||
            typeof json.imagePreviewSrc !== 'string' ||
            typeof json.pdfPageNumber !== 'number' ||
            typeof json.metadata !== 'object' ||
            typeof json.metadata.width !== 'number' ||
            typeof json.metadata.height !== 'number'
        ) {
            log(json);
            throw new Error('Invalid slide item data');
        }
    }

    async clipboardSerialize() {
        const image = new Image();
        image.src = this.pdfPreviewSrc;
        const imageData = await new Promise<string | null>((resolve) => {
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d');
                if (ctx === null) {
                    resolve(null);
                    return;
                }
                ctx.drawImage(image, 0, 0);
                resolve(canvas.toDataURL());
            };
            image.onerror = () => {
                resolve(null);
            };
        });
        return imageData;
    }

    dragSerialize() {
        return {
            type: DragTypeEnum.PDF_SLIDE,
            data: JSON.stringify(this.toJson()),
        };
    }

    static checkIsThisType(item: any) {
        return item instanceof this;
    }
}
