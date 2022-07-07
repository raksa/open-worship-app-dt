import { toastEventListener } from '../event/ToastEventListener';
import ColorNorteInf from './ColorNorteInf';
import {
    ItemSourceInf, MimetypeNameType,
    MetaDataType, createNewItem,
} from './fileHelper';
import FileSource from './FileSource';
import { cloneObject, validateMeta } from './helpers';
import { ItemBase } from './ItemBase';
import { setSetting, getSetting } from './settingHelper';

export type ItemSourceAnyType = ItemSource<any>;
export default abstract class ItemSource<T> implements ItemSourceInf<T>, ColorNorteInf {
    static SELECT_SETTING_NAME = '';
    SELECT_SETTING_NAME: string = '';
    static mimetype: MimetypeNameType;
    fileSource: FileSource;
    content: T;
    metadata: MetaDataType;
    static _itemSourceCache: Map<string, ItemSourceAnyType> = new Map();
    static _objectId = 0;
    _objectId: number;
    constructor(fileSource: FileSource, metadata: MetaDataType,
        content: T) {
        this._objectId = ItemSource._objectId++;
        this.fileSource = fileSource;
        this.metadata = metadata;
        const newContent = cloneObject<any>(content);
        newContent.items = newContent.items.map((item: any) => {
            try {
                return this.itemFromJson(item);
            } catch (error: any) {
                toastEventListener.showSimpleToast({
                    title: 'Instantiating Bible Item',
                    message: error.message,
                });
            }
            return this.itemFromJsonError(item);
        });
        this.content = newContent;
    }
    get maxId() {
        if(this.items.length) {
            return Math.max.apply(Math, this.items.map((item) => item.id));
        }
        return 0;
    }
    get items(): ItemBase[] {
        throw new Error('Method not implemented.');
    }
    static fromJson(json: any, fileSource: FileSource): ItemSourceAnyType {
        throw new Error('Method not implemented.');
    }
    itemFromJson(json: any): any {
        throw new Error('Method not implemented.');
    }
    itemFromJsonError(json: any): any {
        throw new Error('Method not implemented.');
    }
    toJson() {
        const content = {
            ...this.content,
            items: this.items.map((item) => item.toJson()),
        };
        const json = {
            metadata: this.metadata,
            content,
        };
        ItemSource.validate(json);
        return json;
    }
    static validate(json: any) {
        if (!json.content || typeof json.content !== 'object'
            || !json.content.items || !(json.content.items instanceof Array)
            || !validateMeta(json.metadata)) {
            throw new Error('Invalid data');
        }
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
        const selected = getSetting(settingName, '');
        if (selected) {
            return FileSource.genFileSource(selected);
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
        this.fileSource?.fireRefreshDirEvent();
    }
    get colorNote() {
        return this.metadata['colorNote'] || null;
    }
    set colorNote(c: string | null) {
        this.metadata['colorNote'] = c;
        this.save();
    }
    clone<F extends ItemSourceAnyType>() {
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
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        if (fileSource === null) {
            return null;
        }
        const json = await fileSource.readFileToData();
        if (json !== null) {
            try {
                return this.fromJson(json, fileSource);
            } catch (error: any) {
                toastEventListener.showSimpleToast({
                    title: 'Instantiating Data',
                    message: error.message,
                });
            }
        }
        return undefined;
    }
    static async readFileToData(fileSource: FileSource | null, refreshCache?: boolean) {
        if (fileSource === null) {
            return null;
        }
        if (refreshCache) {
            this._itemSourceCache.delete(fileSource.filePath);
        }
        if (this._itemSourceCache.has(fileSource.filePath)) {
            return this._itemSourceCache.get(fileSource.filePath);
        }
        const data = await this.readFileToDataNoCache(fileSource);
        if (data) {
            this._itemSourceCache.set(fileSource.filePath, data);
        } else {
            this._itemSourceCache.delete(fileSource.filePath);
        }
        return data;
    }
}
