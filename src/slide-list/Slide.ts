import SlideItem from '../slide-presenting/SlideItem';
import { MimetypeNameType } from '../helper/fileHelper';
import ItemSource from '../helper/ItemSource';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { getSetting } from '../helper/settingHelper';
import FileSource from '../helper/FileSource';

export type SlideType = {
    items: SlideItem[],
};

export default class Slide extends ItemSource<SlideType>{
    static mimetype: MimetypeNameType = 'slide';
    static SELECT_SETTING_NAME = 'slide-selected';
    SELECT_SETTING_NAME = 'slide-selected';
    static fromJson(json: any, fileSource: FileSource) {
        this.validate(json);
        return new Slide(fileSource, json.metadata, json.content);
    }
    get items() {
        return this.content.items;
    }
    itemFromJson(json: any) {
        return SlideItem.fromJson(json, this.fileSource);
    }
    itemFromJsonError(json: any) {
        return SlideItem.fromJsonError(json, this.fileSource);
    }
    get isSelected() {
        const selectedFS = Slide.getSelectedFileSource();
        return this.fileSource.filePath === selectedFS?.filePath;
    }
    set isSelected(b: boolean) {
        if (this.isSelected === b) {
            return;
        }
        if (b) {
            Slide.setSelectedFileSource(this.fileSource);
            previewingEventListener.presentSlide(this);
        } else {
            Slide.setSelectedFileSource(null);
            previewingEventListener.presentSlide(null);
        }
        this.fileSource.fireRefreshDirEvent();
    }
    getItemById(id: number) {
        return this.content.items.find((item) => item.id === id) || null;
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        return super.readFileToDataNoCache(fileSource) as Promise<Slide | null | undefined>;
    }
    static async readFileToData(fileSource: FileSource | null, isForceCache?: boolean) {
        return super.readFileToData(fileSource, isForceCache) as Promise<Slide | null | undefined>;
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
