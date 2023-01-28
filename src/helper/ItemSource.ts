import ColorNoteInf from './ColorNoteInf';
import {
    MimetypeNameType,
    createNewFileDetail,
} from '../server/fileHelper';
import FileSource from './FileSource';
import {
    AnyObjectType, validateAppMeta,
} from './helpers';
import { setSetting, getSetting } from './settingHelper';
import ItemSourceMetaManager from './ItemSourceMetaManager';
import { showSimpleToast } from '../toast/toastHelpers';

export default abstract class ItemSource<T extends {
    toJson(): AnyObjectType;
}> implements ColorNoteInf {
    static SELECT_SETTING_NAME = '';
    SELECT_SETTING_NAME: string = '';
    static mimetype: MimetypeNameType;
    fileSource: FileSource;
    static _cache = new Map<string, ItemSource<any>>();
    constructor(fileSource: FileSource) {
        this.fileSource = fileSource;
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
        this.fileSource?.fireSelectEvent();
    }
    get colorNote() {
        return ItemSourceMetaManager.getColorNote(this.fileSource);
    }
    set colorNote(color: string | null) {
        ItemSourceMetaManager.setColorNote(this.fileSource, color);
        this.fileSource.fireRefreshDirEvent();
    }
    abstract get maxItemId(): number;
    abstract get metadata(): AnyObjectType;
    abstract get items(): T[];
    static fromJson(_fileSource: FileSource, _json: any): ItemSource<any> {
        throw new Error('Method not implemented.');
    }
    toJson() {
        const json = {
            metadata: this.metadata,
            items: this.items.map((item) => item.toJson()),
        };
        ItemSource.validate(json);
        return json;
    }
    static validate(json: AnyObjectType) {
        if (!json.items || !(json.items instanceof Array)
            || !validateAppMeta(json.metadata)) {
            throw new Error('Invalid item source data');
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
            return FileSource.getInstance(selected);
        }
        return null;
    }
    abstract clone(): ItemSource<T>;
    async save(): Promise<boolean> {
        const isSuccess = await this.fileSource.saveData(this);
        if (isSuccess) {
            ItemSource._cache.set(this.fileSource.filePath, this);
        }
        this.fileSource.fireReloadDirEvent();
        return isSuccess;
    }
    static async create(dir: string, name: string, items: AnyObjectType[]) {
        const data = JSON.stringify({
            metadata: {
                fileVersion: 1,
                app: 'OpenWorship',
                initDate: (new Date()).toJSON(),
            },
            items,
        });
        const filePath = await createNewFileDetail(dir, name, data, this.mimetype);
        if (filePath !== null) {
            return FileSource.getInstance(filePath);
        }
        return null;
    }
    static async readFileToDataNoCache(fileSource: FileSource | null) {
        if (fileSource === null) {
            return null;
        }
        const json = await fileSource.readFileToJsonData();
        if (json !== null) {
            try {
                return this.fromJson(fileSource, json);
            } catch (error: any) {
                showSimpleToast('Instantiating Data', error.message);
            }
        }
        return undefined;
    }
    static deleteCache(key: string) {
        this._cache.delete(key);
    }
    static async readFileToData(fileSource: FileSource | null, refreshCache?: boolean) {
        if (fileSource === null) {
            return null;
        }
        if (refreshCache) {
            this.deleteCache(fileSource.filePath);
        }
        if (this._cache.has(fileSource.filePath)) {
            return this._cache.get(fileSource.filePath);
        }
        const data = await this.readFileToDataNoCache(fileSource);
        if (data) {
            this._cache.set(fileSource.filePath, data);
        } else {
            this.deleteCache(fileSource.filePath);
        }
        return data;
    }
}
