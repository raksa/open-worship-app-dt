import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { getAllDisplays } from '../helper/displayHelper';
import { MetaDataType } from '../helper/fileHelper';
import FileSource from '../helper/FileSource';
import { getAppInfo } from '../helper/helpers';
import { ItemBase } from '../helper/ItemBase';
import Slide from '../slide-list/Slide';

export default class SlideItem extends ItemBase {
    metadata: MetaDataType;
    static SELECT_SETTING_NAME = 'slide-item-selected';
    id: number;
    fileSource: FileSource;
    isCopied: boolean;
    _html: string;
    constructor(id: number, html: string, metadata: MetaDataType,
        fileSource: FileSource) {
        super();
        this.id = id;
        this._html = html;
        this.metadata = metadata;
        this.fileSource = fileSource;
        this.isCopied = false;
    }
    static validate(item: any) {
        try {
            if (item.html && item.id) {
                return true;
            }
        } catch (error) {
            console.log(error);
        }
        return false;
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
        this.fileSource.refreshDir();
    }
    get html() {
        return this._html;
    }
    set html(newHtml: string) {
        if (newHtml !== this._html) {
            this._html = newHtml;
            this.fileSource.refreshDir();
        }
    }
    async isEditing(index: number, slide?: Slide | null) {
        slide = slide || await Slide.readFileToDataNoCache(this.fileSource);
        if (slide) {
            const slideItem = slide.content.items.find((item) => item.id === this.id);
            if (slideItem) {
                if (index !== slide.content.items.indexOf(slideItem)) {
                    return true;
                }
                return slideItem.html !== this._html;
            } else {
                return true;
            }
        }
        return false;
    }
    clone() {
        return new SlideItem(this.id, this._html, {}, this.fileSource);
    }
    toJson() {
        return {
            id: this.id,
            html: this._html,
        };
    }
    static async getSelectedItem() {
        const selected = this.getSelectedResult();
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
