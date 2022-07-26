import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { toastEventListener } from '../event/ToastEventListener';
import { getAllDisplays } from '../helper/displayHelper';
import { MetaDataType } from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { ItemBase } from '../helper/ItemBase';
import Slide from './Slide';
import slideEditingCacheManager from '../slide-editor/slideEditingCacheManager';
import CanvasController from '../slide-editor/canvas/CanvasController';
import { genDefaultHtmlString } from '../slide-editor/canvas/box/BENTextViewMode';

export default class SlideItem extends ItemBase {
    metadata: MetaDataType;
    static SELECT_SETTING_NAME = 'slide-item-selected';
    id: number;
    fileSource: FileSource;
    isCopied: boolean;
    _htmlString: string;
    static copiedItem: SlideItem | null = null;
    static _cache = new Map<string, SlideItem>();
    constructor(id: number, htmlString: string, metadata: MetaDataType,
        fileSource: FileSource) {
        super();
        this.id = id;
        this._htmlString = htmlString;
        this.metadata = metadata;
        this.fileSource = fileSource;
        this.isCopied = false;
        const key = SlideItem.genKey(this);
        SlideItem._cache.set(key, this);
    }
    get canvasController() {
        return CanvasController.getInstant(this);
    }
    get key() {
        return SlideItem.genKey(this);
    }
    get isSelected() {
        const selected = SlideItem.getSelectedResult();
        return selected?.fileSource.filePath === this.fileSource.filePath &&
            selected?.id === this.id;
    }
    set isSelected(b: boolean) {
        if (this.isSelected === b) {
            return;
        }
        if (b) {
            SlideItem.setSelectedItem(this);
            slideListEventListenerGlobal.selectSlideItem(this);
        } else {
            SlideItem.setSelectedItem(null);
            slideListEventListenerGlobal.selectSlideItem(null);
        }
        this.fileSource.fireSelectEvent();
    }
    get htmlString() {
        return this._htmlString;
    }
    set htmlString(newHtmlString: string) {
        this._htmlString = newHtmlString;
        slideEditingCacheManager.saveBySlideItem(this, true);
        this.fileSource.fireEditEvent(this);
    }
    async isEditing(index: number, slide?: Slide | null) {
        slide = slide || await Slide.readFileToDataNoCache(this.fileSource, true);
        if (slide) {
            const slideItem = slide.getItemById(this.id);
            if (slideItem) {
                if (index !== slide.items.indexOf(slideItem)) {
                    return true;
                }
                return slideItem.htmlString !== this.htmlString;
            } else {
                return true;
            }
        }
        return false;
    }
    static getSelectedEditingResult() {
        const selected = this.getSelectedResult();
        const slideSelected = Slide.getSelectedFileSource();
        if (selected?.fileSource.filePath === slideSelected?.filePath) {
            return selected;
        }
        return null;
    }
    static async getSelectedItem() {
        const selected = this.getSelectedEditingResult();
        if (selected !== null) {
            const slide = await Slide.readFileToData(selected.fileSource);
            return slide?.getItemById(selected.id);
        }
        return null;
    }
    static getDefaultDim() {
        const { presentDisplay } = getAllDisplays();
        const { width, height } = presentDisplay.bounds;
        return { width, height };
    }
    static defaultSlideItem() {
        const { width, height } = this.getDefaultDim();
        // TODO: set width and height for present screen
        return {
            id: -1,
            html: `<div style="width: ${width}px; height: ${height}px;">`
                + genDefaultHtmlString()
                + '</div>',
        };
    }
    static fromJson(json: {
        id: number, html: string, metadata: MetaDataType,
    }, fileSource: FileSource) {
        this.validate(json);
        return new SlideItem(json.id, json.html, json.metadata, fileSource);
    }
    static fromJsonError(json: any, fileSource: FileSource) {
        const item = new SlideItem(-1, '', {}, fileSource);
        item.jsonError = json;
        return item;
    }
    toJson(): {
        id: number,
        html: string,
        metadata: MetaDataType,
    } {
        if (this.isError) {
            return this.jsonError;
        }
        return {
            id: this.id,
            html: this._htmlString,
            metadata: this.metadata,
        };
    }
    static validate(json: any) {
        if (!json.html || typeof json.id !== 'number') {
            console.log(json);
            throw new Error('Invalid slide item data');
        }
    }
    clone(isDuplicateId?: boolean) {
        try {
            const slideItem = SlideItem.fromJson(this.toJson(), this.fileSource);
            if (!isDuplicateId) {
                slideItem.id = -1;
            }
            return slideItem;
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Cloning Slide Item',
                message: error.message,
            });
        }
        return null;
    }
    static genKeyByFileSource(fileSource: FileSource, id: number) {
        return `${fileSource.filePath}:${id}`;
    }
    static genKey(slideItem: SlideItem) {
        return this.genKeyByFileSource(slideItem.fileSource, slideItem.id);
    }
    genKey() {
        return SlideItem.genKeyByFileSource(this.fileSource, this.id);
    }
    static extractKey(key: string) {
        const arr = key.split(':');
        return {
            filePath: arr[0],
            id: arr[1],
        };
    }
    static getByKey(key: string) {
        return this._cache.get(key) || null;
    }
}
