import ColorNorteInf from './ColorNorteInf';
import {
    ItemSourceInf, MimetypeNameType,
    MetaDataType, createNewItem,
} from './fileHelper';
import FileSource from './FileSource';
import { cloneObject } from './helpers';
import { setSetting, getSetting } from './settingHelper';

export default abstract class ItemSource<T> implements ItemSourceInf<T>, ColorNorteInf {
    static SELECT_SETTING_NAME = '';
    SELECT_SETTING_NAME: string = '';
    static mimetype: MimetypeNameType;
    fileSource: FileSource;
    content: T;
    metadata: MetaDataType;
    static _itemSourceCache: Map<string, ItemSource<any>> = new Map();
    static _objectId = 0;
    _objectId: number;
    constructor(fileSource: FileSource, metadata: MetaDataType,
        content: T) {
        this.fileSource = fileSource;
        this.metadata = metadata;
        this.content = content;
        this._objectId = ItemSource._objectId++;
    }
    static setSelectedFileSource(fileSource: FileSource | null, settingName?: string) {
        settingName = settingName || this.SELECT_SETTING_NAME;
        if (!settingName) {
            return;
        }
        setSetting(settingName, fileSource === null ? '' : fileSource.filePath);
    }
    static getSelectedFileSource(settingName?: string) {
        settingName = settingName || this.SELECT_SETTING_NAME;
        if (!settingName) {
            return null;
        }
        const filePath = getSetting(settingName, '');
        if (filePath) {
            return FileSource.genFileSource(filePath, undefined, true);
        }
        return null;
    }
    get isSelected() {
        const selectedFS = ItemSource.getSelectedFileSource(this.SELECT_SETTING_NAME);
        return this.fileSource.filePath === selectedFS?.filePath;
    }
    set isSelected(b: boolean) {
        if (this.isSelected === b) {
            return;
        }
        ItemSource.setSelectedFileSource(b ? this.fileSource : null,
            this.SELECT_SETTING_NAME);
        this.fileSource?.refreshDir();
    }
    get colorNote() {
        return this.metadata['colorNote'] || null;
    }
    set colorNote(c: string | null) {
        this.metadata['colorNote'] = c;
        this.save();
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
    static async create(dir: string, name: string, content?: Object) {
        if (!content) {
            return null;
        }
        const data = JSON.stringify({
            metadata: {
                fileVersion: 1,
                app: 'OpenWorship',
                initDate: (new Date()).toJSON(),
            },
            content,
        });
        const filePath = await createNewItem(dir, name, data, this.mimetype);
        if (filePath !== null) {
            return FileSource.genFileSource(filePath);
        }
        return null;
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
        }) => ItemSource<any>, refreshCache?: boolean) {
        if (fileSource === null) {
            return null;
        }
        if (refreshCache) {
            this._itemSourceCache.delete(fileSource.filePath);
        }
        if (this._itemSourceCache.has(fileSource.filePath)) {
            return this._itemSourceCache.get(fileSource.filePath) as T;
        }
        const data = await this._readFileToDataNoCache<T>(fileSource, validator, constr);
        if (data) {
            this._itemSourceCache.set(fileSource.filePath, data);
        } else {
            this._itemSourceCache.delete(fileSource.filePath);
        }
        return data;
    }
}
