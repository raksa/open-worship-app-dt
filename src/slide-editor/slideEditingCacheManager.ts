import SlideItem from '../slide-list/SlideItem';
import FileSource from '../helper/FileSource';
import {
    ChangeHistory,
} from '../slide-list/slideHelpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import SlideBase from '../slide-list/SlideBase';
import Slide from '../slide-list/Slide';
import { MetaDataType } from '../helper/fileHelper';

const slideEditingCacheManager = {
    SETTING_NAME: 'slide-editing-cache',
    getObject() {
        const str = getSetting(this.SETTING_NAME, '{}');
        try {
            return JSON.parse(str);
        } catch (error) {
            return {};
        }
    },
    setObject(data: Object) {
        setSetting(this.SETTING_NAME, JSON.stringify(data));
    },
    getMetadata(fileSource: FileSource): MetaDataType {
        const data = this.getObject();
        const slideData = data[fileSource.filePath];
        return slideData && slideData[fileSource.filePath] || {};
    },
    setMetadata(fileSource: FileSource, key:string, value:string) {
        const data = this.getObject();
        const cacheData = data[fileSource.filePath];
        cacheData[fileSource.filePath] = cacheData[fileSource.filePath] || {};
        cacheData[key] = value;
        this.save(cacheData, fileSource);
    },
    getData(fileSource: FileSource): {
        history: {
            undo: ChangeHistory[],
            redo: ChangeHistory[],
        },
        content: {
            items: SlideItem[],
        },
    } | null {
        const data = this.getObject();
        const slideData = data[fileSource.filePath];
        if (slideData && typeof slideData.history === 'object' &&
            typeof slideData.content === 'object') {
            const convertItems = (items: any[]) => {
                return this.itemsFromJson(fileSource, items);
            };
            try {
                const undo = slideData.history.undo;
                const redo = slideData.history.redo;
                return {
                    history: {
                        undo: undo.map((undoItem: any) => {
                            return {
                                items: convertItems(undoItem.items),
                            };
                        }),
                        redo: redo.map((redoItem: any) => {
                            return {
                                items: convertItems(redoItem.items),
                            };
                        }),
                    },
                    content: {
                        items: convertItems(slideData.content.items),
                    },
                };
            } catch (error) {
                console.log(error);
            }
        }
        this.delete(fileSource);
        return null;
    },
    itemsFromJson(fileSource: FileSource, items: any[]) {
        return items.map((json: any) => {
            return SlideItem.fromJson(json, fileSource);
        });
    },
    itemsToJson(items: SlideItem[]) {
        return items.map((item) => item.toJson());
    },
    slideBaseToCacheData(slideBase: SlideBase) {
        const undo = slideBase._history.undo.map((history) => {
            return {
                items: this.itemsToJson(history.items),
            };
        });
        const redo = slideBase._history.redo.map((history) => {
            return {
                items: this.itemsToJson(history.items),
            };
        });
        return {
            history: {
                undo,
                redo,
            },
            content: {
                items: this.itemsToJson(slideBase.items),
            },
        };
    },
    save(cacheData: Object, fileSource: FileSource, isSilent?: boolean) {
        const data = this.getObject();
        data[fileSource.filePath] = cacheData;
        this.setObject(data);
        if (!isSilent) {
            fileSource.fireUpdateEvent();
        }
    },
    saveBySlideBase(slideBase: SlideBase, isSilent?: boolean) {
        const cacheData = this.slideBaseToCacheData(slideBase);
        this.save(cacheData, slideBase.fileSource, isSilent);
    },
    saveBySlideItem: async function (slideItem: SlideItem, isSilent?: boolean) {
        const slide = await Slide.readFileToData(slideItem.fileSource);
        if (slide) {
            const cacheData = this.slideBaseToCacheData(slide);
            cacheData.content.items.forEach((item) => {
                if (item.id === slideItem.id) {
                    item.html = slideItem.htmlString;
                }
            });
            this.save(cacheData, slideItem.fileSource, isSilent);
        }
    },
    delete(fileSource: FileSource) {
        const data = this.getObject();
        delete data[fileSource.filePath];
        this.setObject(data);
    },
};

export default slideEditingCacheManager;
