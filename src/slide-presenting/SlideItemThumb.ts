import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { getSlideDataByFilePathNoCache } from '../helper/slideHelper';

export default class SlideItemThumb {
    id: string;
    _html: string;
    filePath: string;
    constructor(id: string, html: string, filePath: string) {
        this.id = id;
        this._html = html;
        this.filePath = filePath;
    }
    get isEditing() {
        const slidePresentData = getSlideDataByFilePathNoCache(this.filePath);
        if (slidePresentData !== null) {
            const item = slidePresentData.items.find((item1) => item1.id === this.id);
            if (item) {
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
        return new SlideItemThumb(this.id, this._html, this.filePath);
    }
    toJson() {
        return {
            id: this.id,
            html: this._html,
        };
    }
}
