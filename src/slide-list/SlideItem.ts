import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { toastEventListener } from '../event/ToastEventListener';
import { getAllDisplays } from '../helper/displayHelper';
import { MetaDataType } from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { getAppInfo } from '../helper/helpers';
import { ItemBase } from '../helper/ItemBase';
import Slide from './Slide';
import slideEditingCacheManager from '../slide-editor/slideEditingCacheManager';

export default class SlideItem extends ItemBase {
    metadata: MetaDataType;
    static SELECT_SETTING_NAME = 'slide-item-selected';
    id: number;
    fileSource: FileSource;
    isCopied: boolean;
    _html: string;
    static copiedItem: SlideItem | null = null;
    constructor(id: number, html: string, metadata: MetaDataType,
        fileSource: FileSource) {
        super();
        this.id = id;
        this._html = html;
        this.metadata = metadata;
        this.fileSource = fileSource;
        this.isCopied = false;
    }
    static fromJson(json: any, fileSource: FileSource) {
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
    } {
        if (this.isError) {
            return this.jsonError;
        }
        return {
            id: this.id,
            html: this._html,
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
    get html() {
        return this._html;
    }
    set html(newHtml: string) {
        this._html = newHtml;
        slideEditingCacheManager.saveBySlideItem(this, true);
        const newItem = this.clone(true);
        if (newItem !== null) {
            this.fileSource.fireEditEvent(newItem);
        }
    }
    async isEditing(index: number, slide?: Slide | null) {
        slide = slide || await Slide.readFileToDataNoCache(this.fileSource, true);
        if (slide) {
            const slideItem = slide.getItemById(this.id);
            if (slideItem) {
                if (index !== slide.items.indexOf(slideItem)) {
                    return true;
                }
                return slideItem.html !== this.html;
            } else {
                return true;
            }
        }
        return false;
    }
    static async getSelectedItem() {
        const selected = this.getSelectedResult();
        if (selected !== null) {
            const slide = await Slide.readFileToData(selected.fileSource);
            const selectSlide = await Slide.getSelected();
            if (slide?.fileSource.filePath === selectSlide?.fileSource.filePath) {
                return slide?.getItemById(selected.id);
            }
        }
        return null;
    }
    static getDefaultDim() {
        const { presentDisplay } = getAllDisplays();
        const { width, height } = presentDisplay.bounds;
        return { width, height };
    }
    static genDefaultBoxHTML(width: number = 700, height: number = 400) {
        return '<div class="box-editor pointer " style="top: 279px; left: 356px; transform: rotate(0deg); '
            + `width: ${width}px; height: ${height}px; z-index: 2; display: flex; font-size: 60px; `
            + 'color: rgb(255, 254, 254); align-items: center; justify-content: center; '
            + `background-color: rgba(255, 0, 255, 0.39); position: absolute;">${getAppInfo().name}</div>`;
    }
    static defaultSlideItem() {
        const { width, height } = this.getDefaultDim();
        // TODO: set width and height for present screen
        return {
            id: -1,
            html: `<div style="width: ${width}px; height: ${height}px;">`
                + this.genDefaultBoxHTML()
                + '</div>',
        };
    }
}
