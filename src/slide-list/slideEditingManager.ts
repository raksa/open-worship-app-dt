import SlideItem from './SlideItem';
import FileSource from '../helper/FileSource';
import {
    ChangeHistory,
} from './slideHelpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import SlideBase from './SlideBase';

const slideEditingManager = {
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
    getData(fileSource: FileSource): {
        history: {
            undo: ChangeHistory[],
            redo: ChangeHistory[],
        },
        content: {
            items: SlideItem[],
        }
    } | null {
        const data = this.getObject();
        const slideData = data[fileSource.filePath];
        if (slideData && typeof slideData.history === 'object' &&
            typeof slideData.content === 'object') {
            try {
                const undo = slideData.history.undo;
                const redo = slideData.history.redo;
                return {
                    history: {
                        undo: undo.map((undoItem: any) => {
                            return {
                                items: this.itemsFromJson(fileSource, undoItem.items),
                            };
                        }),
                        redo: redo.map((redoItem: any) => {
                            return {
                                items: this.itemsFromJson(fileSource, redoItem.items),
                            };
                        }),
                    },
                    content: {
                        items: this.itemsFromJson(fileSource, slideData.content.items),
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
    save(slideBase: SlideBase) {
        const data = this.getObject();
        const fileSource = slideBase.fileSource;
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
        const cacheData = {
            content: {
                items: this.itemsToJson(slideBase.items),
            },
            history: {
                undo,
                redo,
            },
        };
        data[fileSource.filePath] = cacheData;
        this.setObject(data);
        slideBase.fileSource.fireReloadDirEvent();
    },
    delete(fileSource: FileSource) {
        const data = this.getObject();
        delete data[fileSource.filePath];
        this.setObject(data);
    },
};

export default slideEditingManager;
