import {
    MimetypeNameType,
    createNewFileDetail,
    fsCheckFileExist,
} from '../server/fileHelpers';
import FileSource from './FileSource';
import { AnyObjectType, validateAppMeta } from './helpers';
import { setSetting, getSetting } from './settingHelpers';

const cache = new Map<string, AppDocumentSourceAbs>();
export default abstract class AppDocumentSourceAbs {
    protected static SELECT_SETTING_NAME = 'selected';
    SELECT_SETTING_NAME: string = '';
    protected static mimetypeName: MimetypeNameType = 'other';
    filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    abstract toJson(): AnyObjectType;

    get fileSource() {
        return FileSource.getInstance(this.filePath);
    }

    static validate(json: AnyObjectType) {
        if (
            !json.items ||
            !(json.items instanceof Array) ||
            !validateAppMeta(json.metadata)
        ) {
            throw new Error('Invalid item source data');
        }
    }

    private static toSettingName(settingName?: string): string {
        return settingName || this.SELECT_SETTING_NAME;
    }

    static setSelectedFileSource(
        filePath: string | null,
        settingName?: string,
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

    static async create(dir: string, name: string, items: AnyObjectType[]) {
        const data = JSON.stringify({
            metadata: {
                fileVersion: 1,
                app: 'OpenWorship',
                initDate: new Date().toJSON(),
            },
            items,
        });
        const filePath = await createNewFileDetail(
            dir,
            name,
            data,
            this.mimetypeName,
        );
        if (filePath !== null) {
            return FileSource.getInstance(filePath);
        }
        return null;
    }

    static deleteCache(filePath: string) {
        cache.delete(filePath);
    }

    static _getInstance<T extends AppDocumentSourceAbs>(
        filePath: string,
        createInstance: () => T,
    ) {
        if (!cache.has(filePath)) {
            const itemSource = createInstance();
            cache.set(filePath, itemSource as any);
        }
        return cache.get(filePath) as any as T;
    }
}
