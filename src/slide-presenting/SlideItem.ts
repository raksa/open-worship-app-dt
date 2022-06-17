import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { getAllDisplays } from '../helper/displayHelper';
import FileSource from '../helper/FileSource';
import { getAppInfo } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import Slide from '../slide-list/Slide';
import { THUMB_SELECTED_SETTING_NAME } from './SlideItemsControllerBase';

export default class SlideItem {
    index: number;
    id: string;
    _html: string;
    fileSource: FileSource;
    isCopied: boolean;
    _isSelected: boolean = false;
    constructor(index: number, id: string, html: string,
        fileSource: FileSource) {
        this.index = index;
        this.id = id;
        this._html = html;
        this.fileSource = fileSource;
        this.isCopied = false;

        const slideItemThumbSelected = getSetting(THUMB_SELECTED_SETTING_NAME, '');
        const parsed = SlideItem.parseSlideItemThumbSelected(slideItemThumbSelected,
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
            setSetting(THUMB_SELECTED_SETTING_NAME, this.id);
            slideListEventListenerGlobal.selectSlideItemThumb(this);
        } else {
            slideListEventListenerGlobal.selectSlideItemThumb(null);
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
    async isEditing(slide?: Slide | null) {
        slide = slide || await Slide.readFileToDataNoCache(this.fileSource);
        if (slide) {
            const item = slide.content.items.find((item1) => item1.id === this.id);
            if (item) {
                if (item.index !== this.index) {
                    return true;
                }
                return item.html !== this._html;
            } else {
                return true;
            }
        }
        return false;
    }
    clone() {
        return new SlideItem(-1, this.id, this._html, this.fileSource);
    }
    toJson() {
        return {
            id: this.id,
            html: this._html,
        };
    }
    static toSlideItemThumbSelected(fileSource: FileSource | null, id: string | null) {
        if (fileSource === null || id === null) {
            return null;
        }
        return `${fileSource.filePath},${id}`;
    }
    static extractSlideItemThumbSelected(slideFilePathId: string) {
        const [slideFilePath, id] = slideFilePathId.split(',');
        return {
            fileSource: FileSource.genFileSource(slideFilePath),
            id,
        };
    }
    static parseSlideItemThumbSelected(selected: string, fileSource: FileSource | null) {
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
    static async getValidSlideItemThumbSelected() {
        const fileSource = Slide.getSelectedSlideFileSource();
        const slideItemThumbSelected = getSetting(THUMB_SELECTED_SETTING_NAME, '');
        const result = this.parseSlideItemThumbSelected(slideItemThumbSelected, fileSource);
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
