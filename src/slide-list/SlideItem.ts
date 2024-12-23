import { createContext, use } from 'react';

import { ItemBase } from '../helper/ItemBase';
import { AnyObjectType, cloneJson } from '../helper/helpers';
import Canvas from '../slide-editor/canvas/Canvas';
import SlideEditorCacheManager from './SlideEditorCacheManager';
import { CanvasItemPropsType } from '../slide-editor/canvas/CanvasItem';
import { DisplayType } from '../_screen/screenHelpers';
import DragInf, { DragTypeEnum } from '../helper/DragInf';
import { log } from '../helper/loggerHelpers';
import { handleError } from '../helper/errorHelpers';

export type SlideItemType = {
    id: number,
    canvasItems: CanvasItemPropsType[],
    metadata: AnyObjectType,
    isPdf?: boolean,
    imagePreviewSrc?: string,
    filePath?: string,
    pdfPageNumber?: number,
};

export default class SlideItem extends ItemBase implements DragInf<string> {
    private _originalJson: SlideItemType;
    static readonly SELECT_SETTING_NAME = 'slide-item-selected';
    id: number;
    filePath: string;
    showingType: 'solo' | 'merge' = 'solo'; // TODO: implement this
    // TODO: implement copying elements
    editorCacheManager: SlideEditorCacheManager;
    static readonly KEY_SEPARATOR = '<siid>';
    constructor(
        id: number, filePath: string, json: SlideItemType,
        editorCacheManager?: SlideEditorCacheManager,
    ) {
        super();
        this.id = id;
        this._originalJson = cloneJson(json);
        this.filePath = filePath;
        if (editorCacheManager !== undefined) {
            this.editorCacheManager = editorCacheManager;
        } else {
            this.editorCacheManager = new SlideEditorCacheManager(
                filePath, {
                items: [json],
                metadata: {},
            });
            this.editorCacheManager.isUsingHistory = false;
        }
    }

    get isPdf() {
        return this.originalJson.isPdf;
    }

    get pdfPreviewSrc() {
        return this.originalJson.imagePreviewSrc ?? null;
    }

    get key() {
        return SlideItem.genKeyByFileSource(this.filePath, this.id);
    }

    get originalJson() {
        return this._originalJson;
    }

    checkIsSame(slideItem: SlideItemType | SlideItem) {
        return this.id === slideItem.id;
    }

    set originalJson(json: SlideItemType) {
        this._originalJson = json;
        const items = this.editorCacheManager.presenterJson.items;
        const newItems = items.map((item) => {
            if (this.checkIsSame(item)) {
                return this.toJson();
            }
            return item;
        });
        this.editorCacheManager.pushSlideItems(newItems);
        this.fileSource?.fireEditEvent(this);
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

    get isChanged() {
        return this.editorCacheManager.checkIsSlideItemChanged(this.id);
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

    static fromJson(
        json: SlideItemType, filePath: string,
        editorCacheManager?: SlideEditorCacheManager,
    ) {
        return new SlideItem(json.id, filePath, json, editorCacheManager);
    }

    static fromJsonError(
        json: AnyObjectType, filePath: string,
        editorCacheManager?: SlideEditorCacheManager,
    ) {
        const newJson = {
            id: -1,
            metadata: {},
            canvasItems: [],
        };
        const item = new SlideItem(-1, filePath, newJson, editorCacheManager);
        item.jsonError = json;
        return item;
    }

    toJson(): SlideItemType {
        if (this.isError) {
            return this.jsonError;
        }
        const { isPdf } = this.originalJson;
        const filePath = isPdf ? this.filePath : undefined;
        const pdfPageNumber = (
            isPdf ? this.originalJson.pdfPageNumber : undefined
        );
        const imagePreviewSrc = (
            isPdf ? this.originalJson.imagePreviewSrc : undefined
        );
        return {
            id: this.id,
            canvasItems: this.canvasItemsJson,
            metadata: this.metadata,
            isPdf, filePath, pdfPageNumber, imagePreviewSrc,
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

    clone(isDuplicateId?: boolean) {
        const slideItem = SlideItem.fromJson(this.toJson(), this.filePath);
        if (!isDuplicateId) {
            slideItem.id = -1;
        }
        return slideItem;
    }

    static genKeyByFileSource(filePath: string, id: number) {
        return `${filePath}${this.KEY_SEPARATOR}${id}`;
    }

    checkIsWrongDimension({ bounds }: DisplayType) {
        return bounds.width !== this.width ||
            bounds.height !== this.height;
    }

    dragSerialize() {
        const dragging: any = {
            key: this.key, isPdf: this.isPdf,
        };
        if (this.isPdf) {
            dragging['pdfData'] = {
                src: this.pdfPreviewSrc,
                width: this.width,
                height: this.height,
            };
        }
        return {
            type: DragTypeEnum.SLIDE_ITEM, data: JSON.stringify(dragging),
        };
    }

    showInViewport() {
        setTimeout(() => {
            const querySelector = `[data-slide-item-id="${this.id}"]`;
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
            SlideItem.validate(data);
            return SlideItem.fromJson(data, filePath);
        } catch (error) {
            handleError(error);
        }
        return null;
    }

    static fromPdfJson({ filePath, pageNumber, src, width = 0, height = 0 }: {
        filePath: string, pageNumber: number, src: string,
        width?: number, height?: number
    }) {
        return new SlideItem(pageNumber, filePath, {
            id: pageNumber, canvasItems: [], isPdf: true,
            imagePreviewSrc: src,
            filePath: filePath,
            pdfPageNumber: pageNumber,
            metadata: { width, height },
        });
    }
}

export const SelectedEditingSlideItemContext = createContext<{
    selectedSlideItem: SlideItem | null,
    setSelectedSlideItem: (newSelectedSlideItem: SlideItem | null) => void,
} | null>(null);

function useContext() {
    const context = use(SelectedEditingSlideItemContext);
    if (context === null) {
        throw new Error(
            'useSelectedEditingSlideItemContext must be used within a ' +
            'SelectedEditingSlideItemContext'
        );
    }
    return context;
}

export function useSelectedEditingSlideItemContext() {
    const context = useContext();
    if (context.selectedSlideItem === null) {
        throw new Error('No selected slide item');
    }
    return context.selectedSlideItem;
}

export function useSelectedEditingSlideItemSetterContext() {
    const context = useContext();
    return context.setSelectedSlideItem;
}
