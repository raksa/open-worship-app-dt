import SlideItem from './SlideItem';
import { MimetypeNameType } from '../helper/fileHelper';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { getSetting } from '../helper/settingHelper';
import FileSource from '../helper/FileSource';
import SlideBase from './SlideBase';
import { toastEventListener } from '../event/ToastEventListener';
import { DisplayType } from '../helper/displayHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import HTML2React from '../slide-editor/HTML2React';
import { THUMBNAIL_SCALE_STEP, MIN_THUMBNAIL_SCALE, MAX_THUMBNAIL_SCALE, openSlideContextMenu } from './slideHelpers';

export default class Slide extends SlideBase {
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
        return this.items.find((item) => item.id === id) || null;
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
    deleteItem(item: SlideItem) {
        if (SlideItem.copiedItem === item) {
            SlideItem.copiedItem = null;
        }
        // TODO: delete item
    }
    checkIsWrongDimension({ bounds }: DisplayType) {
        const found = this.items.map((item) => {
            const html2React = HTML2React.parseHTML(item.html);
            return { width: html2React.width, height: html2React.height };
        }).find(({ width, height }: { width: number, height: number }) => {
            return bounds.width !== width || bounds.height !== height;
        });
        if (found) {
            return {
                slide: found,
                display: { width: bounds.width, height: bounds.height },
            };
        }
        return null;
    }
    async fixSlideDimension({ bounds }: DisplayType) {
        this.items.forEach((item) => {
            const html2React = HTML2React.parseHTML(item.html);
            html2React.width = bounds.width;
            html2React.height = bounds.height;
            item.html = html2React.htmlString;
        });
        if (await this.save()) {
            toastEventListener.showSimpleToast({
                title: 'Fix Slide Dimension',
                message: 'Slide dimension has been fixed',
            });
        } else {
            toastEventListener.showSimpleToast({
                title: 'Fix Slide Dimension',
                message: 'Unable to fix slide dimension',
            });
        }
    }
    showSlideItemContextMenu(e: any) {
        showAppContextMenu(e, [{
            title: 'New Slide Thumb', onClick: () => {
                const item = SlideItem.defaultSlideItem();
                this.add(new SlideItem(item.id, item.html, {},
                    this.fileSource));
            },
        }, {
            title: 'Paste', disabled: SlideItem.copiedItem === null,
            onClick: () => this.paste(),
        }]);
    }
    openContextMenu(e: any, index: number) {
        openSlideContextMenu(e, this, index);
    }
    static toScaleThumbSize(isUp: boolean, currentScale: number) {
        let newScale = currentScale + (isUp ? -1 : 1) * THUMBNAIL_SCALE_STEP;
        if (newScale < MIN_THUMBNAIL_SCALE) {
            newScale = MIN_THUMBNAIL_SCALE;
        }
        if (newScale > MAX_THUMBNAIL_SCALE) {
            newScale = MAX_THUMBNAIL_SCALE;
        }
        return newScale;
    }
}
