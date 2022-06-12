import { slideListEventListenerGlobal } from '../event/SlideListEventListener';
import { getSlideDataByFilePath } from '../helper/slideHelper';

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
        const slidePresentData = getSlideDataByFilePath(this.filePath);
        if (slidePresentData !== null) {
            const item = slidePresentData.items.find((item1) => item1.id === this.id);
            if (item) {
                return item.id === this.id && item._html !== this._html;
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
}
