import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { getSlideDataByFilePathNoCache } from '../helper/slideHelper';

export default class SlideItemThumb {
    index: number;
    id: string;
    _html: string;
    filePath: string;
    constructor(index: number, id: string, html: string, filePath: string) {
        this.index = index;
        this.id = id;
        this._html = html;
        this.filePath = filePath;
    }
    async isEditing() {
        const slidePresentData = await getSlideDataByFilePathNoCache(this.filePath);
        if (slidePresentData !== null) {
            const item = slidePresentData.items.find((item1) => item1.id === this.id);
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
    get html() {
        return this._html;
    }
    set html(newHtml: string) {
        if (newHtml !== this._html) {
            this._html = newHtml;
            slideListEventListenerGlobal.refresh();
        }
    }
    clone() {
        return new SlideItemThumb(-1, this.id, this._html, this.filePath);
    }
    toJson() {
        return {
            id: this.id,
            html: this._html,
        };
    }
}
