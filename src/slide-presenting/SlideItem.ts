import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { getAllDisplays } from '../helper/displayHelper';
import FileSource from '../helper/FileSource';
import { getAppInfo } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import Slide from '../slide-list/Slide';
import { SLIDE_ITEM_SELECTED_SETTING_NAME } from './SlideItemsControllerBase';

export default class SlideItem {
    id: string;
    _html: string;
    fileSource: FileSource;
    isCopied: boolean;
    _isSelected: boolean = false;
    constructor(id: string, html: string,
        fileSource: FileSource) {
        this.id = id;
        this._html = html;
        this.fileSource = fileSource;
        this.isCopied = false;

        const slideItem = getSetting(SLIDE_ITEM_SELECTED_SETTING_NAME, '');
        const parsed = SlideItem.parseSelectedSlideItem(slideItem,
            this.fileSource);
        this.isSelected = parsed?.id === this.id;
    }
    get isSelected() {
        return this._isSelected;
    }
    set isSelected(b: boolean) {
        if (this._isSelected === b) {
            return;
        }
        this._isSelected = b;
        if (this.isSelected) {
            setSetting(SLIDE_ITEM_SELECTED_SETTING_NAME, this.id);
            slideListEventListenerGlobal.selectSlideItem(this);
        } else {
            slideListEventListenerGlobal.selectSlideItem(null);
        }
        this.fileSource.refresh();
    }
    get html() {
        return this._html;
    }
    set html(newHtml: string) {
        if (newHtml !== this._html) {
            this._html = newHtml;
            this.fileSource.refresh();
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
        return new SlideItem(this.id, this._html, this.fileSource);
    }
    toJson() {
        return {
            id: this.id,
            html: this._html,
        };
    }
    static toSlideItemSelected(fileSource: FileSource | null, id: string | null) {
        if (fileSource === null || id === null) {
            return null;
        }
        return `${fileSource.filePath},${id}`;
    }
    static extractSlideItemSelected(slideFilePathId: string) {
        const [slideFilePath, id] = slideFilePathId.split(',');
        return {
            fileSource: FileSource.genFileSource(slideFilePath),
            id,
        };
    }
    static parseSelectedSlideItem(selected: string, fileSource: FileSource | null) {
        if (!selected || fileSource === null) {
            return null;
        }
        try {
            if (selected.includes(fileSource.filePath)) {
                const id = selected.split(',')[1];
                if (id) {
                    return { id };
                }
            }
        } catch (error) {
            console.log(error);
        }
        return null;
    }
    static async getSelectedSlideItem() {
        const fileSource = Slide.getSelectedSlideFileSource();
        const slideItem = getSetting(SLIDE_ITEM_SELECTED_SETTING_NAME, '');
        const result = this.parseSelectedSlideItem(slideItem, fileSource);
        if (result !== null) {
            const slide = await Slide.readFileToData(fileSource);
            if (slide) {
                return slide.content.items.find((item: any) => {
                    return item.id === result.id;
                }) || null;
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
        return {
            id: '0', // TODO: set width and height for present screen
            html: `<div style="width: ${width}px; height: ${height}px;">`
                + this.genDefaultBoxHTML()
                + '</div>',
        };
    }
}
