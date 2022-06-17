import {
    ItemSourceInf, MimetypeNameType,
    MetaDataType, createNewItem,
} from './fileHelper';
import FileSource from './FileSource';
import { cloneObject } from './helpers';

export default abstract class ItemSource<T> implements ItemSourceInf<T> {
    static mimetype: MimetypeNameType;
    fileSource: FileSource;
    content: T;
    metadata: MetaDataType;
    static _itemSourceCache: Map<string, ItemSource<any>> = new Map();
    constructor(fileSource: FileSource, metadata: MetaDataType,
        content: T) {
        this.fileSource = fileSource;
        this.metadata = metadata;
        this.content = content;
    }
    toJson() {
        return {
            metadata: this.metadata,
            content: this.content as Object,
        };
    }
    clone<F extends ItemSource<any>>() {
        const item = Object.assign(Object.create(Object.getPrototypeOf(this)), this) as F;
        item.metadata = cloneObject(item.metadata);
        item.content = cloneObject(item.content);
        return item;
    }
    async save(): Promise<boolean> {
        const isSuccess = await this.fileSource.saveData(this);
        if (isSuccess) {
            ItemSource._itemSourceCache.set(this.fileSource.filePath, this);
        }
        return isSuccess;
    }
    async delete(): Promise<boolean> {
        const isSuccess = await this.fileSource.delete();
        if (isSuccess) {
            ItemSource._itemSourceCache.delete(this.fileSource.filePath);
        }
        return isSuccess;
    }
    static async createNew(dir: string, name: string, content: Object) {
        const data = JSON.stringify({
            metadata: {
                fileVersion: 1,
                app: 'OpenWorship',
                initDate: (new Date()).toJSON(),
            },
            content,
        });
        return createNewItem(dir, name, data, this.mimetype);
    }
    static async _readFileToDataNoCache<T extends ItemSource<any>>(fileSource: FileSource | null
        , validator: (json: Object) => boolean, constr: (fileSource: FileSource, json: {
            metadata: MetaDataType,
            content: any,
        }) => ItemSource<any>) {
        if (fileSource === null) {
            return null;
        }
        const json = await fileSource.readFileToData(validator);
        if (json) {
            return constr(fileSource, json) as T;
        }
        return json;
    }
    static async _readFileToData<T extends ItemSource<any>>(fileSource: FileSource | null
        , validator: (json: Object) => boolean, constr: (fileSource: FileSource, json: {
            metadata: MetaDataType,
            content: any,
        }) => ItemSource<any>) {
        if (fileSource === null) {
            return null;
        }
        if (ItemSource._itemSourceCache.has(fileSource.filePath)) {
            return ItemSource._itemSourceCache.get(fileSource.filePath) as T;
        }
        const data = await this._readFileToDataNoCache<T>(fileSource, validator, constr);
        if (data) {
            ItemSource._itemSourceCache.set(fileSource.filePath, data);
        } else {
            ItemSource._itemSourceCache.delete(fileSource.filePath);
        }
        return data;
    }
}
