import { ItemBase } from '../helper/ItemBase';
import { AnyObjectType, cloneJson } from '../helper/helpers';
import Canvas from '../slide-editor/canvas/Canvas';
import { CanvasItemPropsType } from '../slide-editor/canvas/CanvasItem';
import { DisplayType } from '../_screen/screenHelpers';
import DragInf, { DragTypeEnum } from '../helper/DragInf';
import { log } from '../helper/loggerHelpers';
import { handleError } from '../helper/errorHelpers';
import { ClipboardInf, toKeyByFilePath } from './appDocumentHelpers';

export type SlideItemType = {
    id: number;
    canvasItems: CanvasItemPropsType[];
    metadata: AnyObjectType;
};

export default class Slide
    extends ItemBase
    implements DragInf<string>, ClipboardInf
{
    private _originalJson: SlideItemType;
    static readonly SELECT_SETTING_NAME = 'slide-item-selected';
    id: number;
    filePath: string;

    constructor(id: number, filePath: string, json: SlideItemType) {
        super();
        this.id = id;
        this._originalJson = cloneJson(json);
        this.filePath = filePath;
    }

    get key() {
        return toKeyByFilePath(this.filePath, this.id);
    }

    get originalJson() {
        return this._originalJson;
    }

    set originalJson(json: SlideItemType) {
        this._originalJson = json;
    }

    checkIsSame(item: ItemBase) {
        if (Slide.checkIsThisType(item)) {
            return super.checkIsSame(item);
        }
        return false;
    }

    get metadata() {
        return this.originalJson.metadata;
    }

    set metadata(metadata: AnyObjectType) {
        const json = cloneJson(this.originalJson);
        json.metadata = metadata;
        this.originalJson = json;
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
        return this.metadata.width;
    }

    set width(width: number) {
        const metadata = this.metadata;
        metadata.width = width;
        this.metadata = metadata;
    }

    get height() {
        return this.metadata.height;
    }

    set height(height: number) {
        const metadata = this.metadata;
        metadata.height = height;
        this.metadata = metadata;
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

    static fromJson(json: SlideItemType, filePath: string) {
        return new Slide(json.id, filePath, json);
    }

    static fromJsonError(json: AnyObjectType, filePath: string) {
        const newJson = {
            id: -1,
            metadata: {},
            canvasItems: [],
        };
        const item = new Slide(-1, filePath, newJson);
        item.jsonError = json;
        return item;
    }

    toJson(): SlideItemType {
        if (this.isError) {
            return this.jsonError;
        }
        return this.originalJson;
    }

    static validate(json: AnyObjectType) {
        if (
            typeof json.id !== 'number' ||
            typeof json.metadata !== 'object' ||
            typeof json.metadata.width !== 'number' ||
            typeof json.metadata.height !== 'number' ||
            !(json.canvasItems instanceof Array)
        ) {
            log(json);
            throw new Error('Invalid slide item data');
        }
    }

    clone(isDuplicateId?: boolean) {
        const slide = Slide.fromJson(this.toJson(), this.filePath);
        if (!isDuplicateId) {
            slide.id = -1;
        }
        return slide;
    }

    checkIsWrongDimension({ bounds }: DisplayType) {
        return bounds.width !== this.width || bounds.height !== this.height;
    }

    dragSerialize() {
        const dragging: any = {
            key: this.key,
        };
        return {
            type: DragTypeEnum.SLIDE_ITEM,
            data: JSON.stringify(dragging),
        };
    }

    showInViewport() {
        setTimeout(() => {
            const querySelector = `[data-app-document-item-id="${this.id}"]`;
            const element = document.querySelector(querySelector);
            if (element === null) {
                return;
            }
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
            });
        }, 0);
    }

    clipboardSerialize() {
        const json = this.toJson();
        return JSON.stringify({
            filePath: this.filePath,
            data: json,
        });
    }

    static clipboardDeserialize(json: string) {
        if (!json) {
            return null;
        }
        try {
            const { filePath, data } = JSON.parse(json);
            Slide.validate(data);
            return Slide.fromJson(data, filePath);
        } catch (error) {
            handleError(error);
        }
        return null;
    }

    static checkIsThisType(item: any): boolean {
        return item instanceof Slide;
    }
}
