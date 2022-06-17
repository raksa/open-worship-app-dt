import SlideItem from '../slide-presenting/SlideItem';
import {
    MetaDataType, MimetypeNameType,
} from '../helper/fileHelper';
import { validateMeta } from '../helper/helpers';
import ItemSource from '../helper/ItemSource';
import {
    previewingEventListener,
} from '../event/PreviewingEventListener';
import {
    setSetting, getSetting,
} from '../helper/settingHelper';
import FileSource from '../helper/FileSource';

export type SlidePresentType = {
    items: SlideItem[],
};

export default class Slide extends ItemSource<SlidePresentType>{
    toJson() {
        const content = {
            ...this.content,
            items: this.content.items.map((item) => item.toJson()),
        };
        return {
            metadata: this.metadata,
            content,
        };
    }
    static mimetype: MimetypeNameType = 'slide';
    static _instantiate(fileSource: FileSource, json: {
        metadata: MetaDataType, content: any,
    }) {
        return new Slide(fileSource, json.metadata, json.content);
    }
    static _initItems(slide: ItemSource<any>) {
        slide.content.items = slide.content.items.map((item: any) => {
            return new SlideItem(item.index, item.id,
                item.html, slide.fileSource);
        });
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        const slide = await ItemSource._readFileToDataNoCache<Slide>(fileSource,
            validateSlide, this._instantiate);
        if (slide) {
            this._initItems(slide);
        }
        return slide;
    }
    static async readFileToData(fileSource: FileSource | null, isForceCache?: boolean) {
        const slide = await ItemSource._readFileToData<Slide>(fileSource,
            validateSlide, this._instantiate, isForceCache);
        if (slide) {
            this._initItems(slide);
        }
        return slide;
    }
    static presentSlide(slide: Slide | null) {
        if (slide === null) {
            this.clearSelectedSlide();
        } else {
            this.setSelectedSlideFileSource(slide.fileSource);
        }
        previewingEventListener.presentSlide(slide);
    }
    static clearSelectedSlide() {
        this.setSelectedSlideFileSource(null);
    }
    static setSelectedSlideFileSource(fileSource: FileSource | null) {
        setSetting('selected-slide', fileSource?.filePath || '');
    }
    static getSelectedSlideFileSource() {
        const filePath = getSetting('selected-slide', '');
        if (filePath) {
            return FileSource.genFileSource(filePath);
        }
        return null;
    }
    static async getSelectedSlide() {
        const fileSource = this.getSelectedSlideFileSource();
        if (fileSource !== null) {
            return Slide.readFileToData(fileSource);
        }
        return null;
    }
    static getDefaultSlideList() {
        let defaultSlideList = [];
        try {
            const str = getSetting('slide-list');
            defaultSlideList = JSON.parse(str);
        } catch (error) { }
        return defaultSlideList;
    }

    static defaultSlide() {
        return {
            items: [SlideItem.defaultSlideItem()],
        };
    }
}

export function validateSlideItem(item: any) {
    try {
        if (item.html && item.id) {
            return true;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

export function validateSlide(json: any) {
    try {
        if (!json.content || typeof json.content !== 'object'
            || !json.content.items || !(json.content.items instanceof Array)) {
            return false;
        }
        const content = json.content;
        if (!(content.items as any[]).every((item) => {
            return validateSlideItem(item);
        })) {
            return false;
        }
        if (!validateMeta(json.metadata)) {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
    return true;
}
