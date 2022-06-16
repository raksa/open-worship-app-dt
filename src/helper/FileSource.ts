import EventHandler from '../event/EventHandler';
import {
    toastEventListener,
} from '../event/ToastEventListener';
import fileHelpers from './fileHelper';
import ItemSource from './ItemSource';

type FSListener = (t: FSEventType) => void;
type FSEventType = 'update' | 'delete';
export type RegisteredEventType = {
    type: FSEventType,
    listener: (t: FSEventType) => void,
}
export default class FileSource extends EventHandler {
    basePath: string;
    fileName: string;
    filePath: string;
    src: string;
    static _cache: Map<string, ItemSource<any>> = new Map();
    constructor(basePath: string, fileName: string,
        filePath: string, src: string,) {
        super();
        this.basePath = basePath;
        this.fileName = fileName;
        this.filePath = filePath;
        this.src = src;
    }
    registerEventListener(fsType: FSEventType,
        listener: FSListener): RegisteredEventType {
        this._addOnEventListener(fsType, listener);
        return {
            type: fsType,
            listener,
        };
    }
    unregisterEventListener({ type: tfType, listener }: RegisteredEventType) {
        this._removeOnEventListener(tfType, listener);
    }
    get name() {
        return this.fileName.substring(0, this.fileName.lastIndexOf('.'));
    }
    async readFileToDataNoCache(validator: (json: any) => boolean) {
        try {
            const str = await fileHelpers.readFile(this.filePath);
            if (str !== null) {
                const json = JSON.parse(str);
                if (validator(json)) {
                    return new ItemSource<any>(this, json.metadata, json.content);
                }
                return undefined;
            }
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Reading File Data',
                message: error.message,
            });
        }
        return null;
    }
    async readFileToData(validator: (json: any) => boolean) {
        if (FileSource._cache.has(this.filePath)) {
            return FileSource._cache.get(this.filePath);
        }
        const data = await this.readFileToDataNoCache(validator);
        if (data) {
            FileSource._cache.set(this.filePath, data);
        } else {
            FileSource._cache.delete(this.filePath);
        }
        return data;
    }
    async saveData(data: ItemSource<any>) {
        try {
            const content = JSON.stringify(data.toJson());
            await fileHelpers.overWriteFile(this.filePath, content);
            FileSource._cache.set(this.filePath, data);
            this._addPropEvent('update');
            return true;
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Saving File',
                message: error.message,
            });
        }
        return false;
    }
    async delete() {
        try {
            await fileHelpers.deleteFile(this.filePath);
            FileSource._cache.delete(this.filePath);
            this._addPropEvent('delete');
            return true;
        } catch (error: any) {
            toastEventListener.showSimpleToast({
                title: 'Saving File',
                message: error.message,
            });
        }
        return false;
    }
}
