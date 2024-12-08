import {
    MimetypeNameType, createNewFileDetail, fsCheckFileExist,
} from '../server/fileHelpers';
import FileSource from './FileSource';
import {
    AnyObjectType, validateAppMeta,
} from './helpers';
import { setSetting, getSetting } from './settingHelpers';
import { showSimpleToast } from '../toast/toastHelpers';

const cache = new Map<string, ItemSource<any>>();
export default abstract class ItemSource<T extends {
    toJson(): AnyObjectType;
}> {
    protected static SELECT_SETTING_NAME = 'selected';
    SELECT_SETTING_NAME: string = '';
    protected static mimetype: MimetypeNameType = 'other';
    filePath: string;
    constructor(filePath: string) {
        this.filePath = filePath;
    }
    get isSelected() {
        const selectedFilePath = ItemSource.getSelectedFilePath(
            this.SELECT_SETTING_NAME,
        );
        return this.filePath === selectedFilePath;
    }
    set isSelected(b: boolean) {
        if (this.isSelected === b) {
            return;
        }
        ItemSource.setSelectedFileSource(
            b ? this.filePath : null, this.SELECT_SETTING_NAME,
        );
        const fileSource = FileSource.getInstance(this.filePath);
        fileSource.fireSelectEvent();
    }
    abstract get maxItemId(): number;
    abstract get metadata(): AnyObjectType;
    abstract get items(): T[];
    static fromJson(_filePath: string, _json: any): ItemSource<any> {
        throw new Error('Method not implemented.');
    }
    getItemById(_: number): any {
        return null;
    }
    setItemById(_1: number, _2: any) {
        return;
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
    private static toSettingName(settingName?: string): string {
        return settingName || this.SELECT_SETTING_NAME;
    }
    static setSelectedFileSource(
        filePath: string | null, settingName?: string,
    ) {
        settingName = this.toSettingName(settingName);
        setSetting(settingName, filePath || '');
    }
    static getSelectedFilePath(settingName?: string) {
        settingName = this.toSettingName(settingName);
        const selectedFilePath = getSetting(settingName, '');
        if (selectedFilePath) {
            fsCheckFileExist(selectedFilePath).then((isFileExist) => {
                if (!isFileExist) {
                    this.setSelectedFileSource(null, settingName);
                }
            });
        }
        return selectedFilePath || null;
    }
    abstract clone(): ItemSource<T>;
    async save(): Promise<boolean> {
        const fileSource = FileSource.getInstance(this.filePath);
        const isSuccess = await fileSource.saveDataFromItem(this);
        if (isSuccess) {
            cache.set(this.filePath, this);
        }
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
        const filePath = await createNewFileDetail(dir, name, data,
            this.mimetype,
        );
        if (filePath !== null) {
            return FileSource.getInstance(filePath);
        }
        return null;
    }
    static async readFileToDataNoCache(filePath: string | null) {
        if (filePath === null) {
            return null;
        }
        const fileSource = FileSource.getInstance(filePath);
        const json = await fileSource.readFileToJsonData();
        if (json !== null) {
            try {
                return this.fromJson(filePath, json);
            } catch (error: any) {
                showSimpleToast('Instantiating Data', error.message);
            }
        }
        return undefined;
    }
    static deleteCache(key: string) {
        cache.delete(key);
    }
    static async readFileToData(
        filePath: string | null, refreshCache?: boolean,
    ) {
        if (filePath === null) {
            return null;
        }
        if (refreshCache) {
            this.deleteCache(filePath);
        }
        if (cache.has(filePath)) {
            return cache.get(filePath);
        }
        const data = await this.readFileToDataNoCache(filePath);
        if (data) {
            cache.set(filePath, data);
        } else {
            this.deleteCache(filePath);
        }
        return data;
    }
}
