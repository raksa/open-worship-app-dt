import SlideItem from './SlideItem';
import { MimetypeNameType } from '../helper/fileHelper';
import { previewingEventListener } from '../event/PreviewingEventListener';
import FileSource from '../helper/FileSource';
import SlideBase from './SlideBase';
import { anyObjectType } from '../helper/helpers';

export default class Slide extends SlideBase {
    static mimetype: MimetypeNameType = 'slide';
    static SELECT_SETTING_NAME = 'slide-selected';
    SELECT_SETTING_NAME = 'slide-selected';
    static fromJson(json: anyObjectType, fileSource: FileSource) {
        this.validate(json);
        return new Slide(fileSource, json.metadata, json.content);
    }
    itemFromJson(json: anyObjectType) {
        return SlideItem.fromJson(json as any, this.fileSource);
    }
    itemFromJsonError(json: anyObjectType) {
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
        this.fileSource.fireSelectEvent();
        this.fileSource.fireRefreshDirEvent();
    }
    getItemById(id: number) {
        return this.items.find((item) => item.id === id) || null;
    }
    static async readFileToDataNoCache(fileSource: FileSource | null, isOrigin?: boolean) {
        const slide = await super.readFileToDataNoCache(fileSource) as Slide | null | undefined;
        if (!isOrigin && slide) {
            slide.loadEditingCache();
        }
        return slide;
    }
    static async readFileToData(fileSource: FileSource | null, isForceCache?: boolean) {
        const slide = await super.readFileToData(fileSource, isForceCache) as Slide | null | undefined;
        if (slide) {
            slide.loadEditingCache();
        }
        return slide;
    }
    static async getSelected() {
        const fileSource = this.getSelectedFileSource();
        if (fileSource !== null) {
            return Slide.readFileToData(fileSource);
        }
        return null;
    }
    static async create(dir: string, name: string) {
        return super.create(dir, name, {
            items: [SlideItem.defaultSlideItem()],
        });
    }

}
