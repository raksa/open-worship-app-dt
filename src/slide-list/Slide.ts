import SlideItem from './SlideItem';
import { MimetypeNameType } from '../helper/fileHelper';
import { previewingEventListener } from '../event/PreviewingEventListener';
import FileSource from '../helper/FileSource';
import SlideBase, { SlideType } from './SlideBase';
import { openSlideContextMenu } from './slideHelpers';

export default class Slide extends SlideBase {
    static mimetype: MimetypeNameType = 'slide';
    static SELECT_SETTING_NAME = 'slide-selected';
    SELECT_SETTING_NAME = 'slide-selected';
    static fromJson(fileSource: FileSource, json: SlideType) {
        this.validate(json);
        return new Slide(fileSource, json);
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
        if (isOrigin && slide) {
            slide.editingCacheManager.isUsingHistory = false;
        }
        return slide;
    }
    static async readFileToData(fileSource: FileSource | null, isForceCache?: boolean) {
        const slide = super.readFileToData(fileSource, isForceCache);
        return slide as Promise<Slide | undefined | null>;
    }
    static async getSelected() {
        const fileSource = this.getSelectedFileSource();
        if (fileSource !== null) {
            return this.readFileToData(fileSource);
        }
        return null;
    }
    static async create(dir: string, name: string) {
        return super.create(dir, name,
            [SlideItem.defaultSlideItemData(0)]);
    }
    openContextMenu(e: any, slideItem: SlideItem) {
        openSlideContextMenu(e, this, slideItem);
    }
}
