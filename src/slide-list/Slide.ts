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
    getSetting,
} from '../helper/settingHelper';
import FileSource from '../helper/FileSource';

export type SlidePresentType = {
    items: SlideItem[],
};

export default class Slide extends ItemSource<SlidePresentType>{
    static SELECT_SETTING_NAME = 'slide-selected';
    constructor(fileSource: FileSource, metadata: MetaDataType,
        content: SlidePresentType) {
        super(fileSource, metadata, content);
        this.SELECT_SETTING_NAME = Slide.SELECT_SETTING_NAME;
    }
    static validator(json: any) {
        try {
            if (!json.content || typeof json.content !== 'object'
                || !json.content.items || !(json.content.items instanceof Array)) {
                return false;
            }
            const content = json.content;
            if (!(content.items as any[]).every((item) => {
                return SlideItem.validate(item);
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
    get isSelected() {
        const selectedFS = Slide.getSelectedFileSource();
        return this.fileSource.filePath === selectedFS?.filePath;
    }
    getItemById(id: number) {
        return this.content.items.find((item) => item.id === id) || null;
    }
    static mimetype: MimetypeNameType = 'slide';
    static _instantiate(fileSource: FileSource, json: {
        metadata: MetaDataType, content: any,
    }) {
        return new Slide(fileSource, json.metadata, json.content);
    }
    static _initItems(slide: ItemSource<any>) {
        slide.content.items = slide.content.items.map((item: any) => {
            return new SlideItem(item.id, item.html, {}, slide.fileSource);
        });
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        const slide = await super._readFileToDataNoCache<Slide>(fileSource,
            this.validator, this._instantiate);
        if (slide) {
            this._initItems(slide);
        }
        return slide;
    }
    static async readFileToData(fileSource: FileSource | null, isForceCache?: boolean) {
        const slide = await super._readFileToData<Slide>(fileSource,
            this.validator, this._instantiate, isForceCache);
        if (slide) {
            this._initItems(slide);
        }
        return slide;
    }
    static present(slide: Slide | null) {
        if (slide === null) {
            this.setSelectedFileSource(null);
        } else {
            this.setSelectedFileSource(slide.fileSource);
        }
        previewingEventListener.presentSlide(slide);
    }
    static async getSelected() {
        const fileSource = this.getSelectedFileSource();
        if (fileSource !== null) {
            return Slide.readFileToData(fileSource);
        }
        return null;
    }
    static getDefaultList() {
        let defaultSlideList = [];
        try {
            const str = getSetting('slide-list');
            defaultSlideList = JSON.parse(str);
        } catch (error) { }
        return defaultSlideList;
    }
    static toWrongDimensionString({ slide, display }: {
        slide: { width: number, height: number },
        display: { width: number, height: number },
    }) {
        return `⚠️ slide:${slide.width}x${slide.height} display:${display.width}x${display.height}`;
    }
    static async create(dir: string, name: string) {
        return super.create(dir, name, {
            items: [SlideItem.defaultSlideItem()],
        });
    }
}
