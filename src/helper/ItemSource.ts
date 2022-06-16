import {
    ItemSourceInf, MimetypeNameType,
    MetaDataType, createNewItem,
} from './fileHelper';
import FileSource from './FileSource';
import { cloneObject } from './helpers';

export default class ItemSource<T> implements ItemSourceInf<T> {
    static mimetype: MimetypeNameType;
    static validator: (json: Object) => boolean;
    fileSource: FileSource;
    content: T;
    metadata: MetaDataType;
    constructor(fileSource: FileSource, metadata: MetaDataType,
        content: T) {
        this.fileSource = fileSource;
        this.metadata = metadata;
        this.content = content;
    }
    toJson() {
        return {
            metadata: this.metadata,
            content: this.content,
        };
    }
    clone<F extends ItemSource<any>>() {
        const item = Object.assign(Object.create(Object.getPrototypeOf(this)), this) as F;
        item.metadata = cloneObject(item.metadata);
        item.content = cloneObject(item.content);
        return item;
    }
    async save(): Promise<boolean> {
        return this.fileSource.saveData(this);
    }
    async delete(): Promise<boolean> {
        return this.fileSource.delete();
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
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        if (fileSource === null) {
            return null;
        }
        return fileSource.readFileToDataNoCache(this.validator);
    }
    static async readFileToData(fileSource: FileSource | null) {
        if (fileSource === null) {
            return null;
        }
        return fileSource.readFileToData(this.validator);
    }
}
