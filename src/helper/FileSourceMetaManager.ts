import ToastEventListener from '../event/ToastEventListener';
import appProvider from '../server/appProvider';
import { checkIsAppFile, fsCheckFileExist } from '../server/fileHelper';
import { handleError } from './errorHelpers';
import FileSource from './FileSource';
import { isColor } from './helpers';
import { SettingManager } from './settingHelper';


async function readJsonData(fileSource: FileSource) {
    const json = await fileSource.readFileToJsonData();
    if (json === null) {
        appProvider.appUtils.handleError(
            new Error(`Unable to read file from ${fileSource.filePath}}`)
        );
        ToastEventListener.showSimpleToast({
            title: 'Color Note',
            message: 'Unable to read file',
        });
    }
    return json;
}

export default class FileSourceMetaManager {
    static settingManager = new SettingManager<{ [key: string]: string }>({
        settingName: 'itemSourcesMeta',
        defaultValue: {},
        isErrorToDefault: true,
        validate: (jsonString) => {
            try {
                const json = JSON.parse(jsonString);
                return json instanceof Object;
            } catch (error) {
                handleError(error);
            }
            return false;
        },
        serialize: (json) => JSON.stringify(json),
        deserialize: (jsonString) => JSON.parse(jsonString),
    });
    private static getColorNoteSetting(fileSource: FileSource): string | null {
        const setting = this.settingManager.getSetting();
        const color = setting[fileSource.filePath];
        if (isColor(color)) {
            return color;
        }
        return null;
    }
    private static setColorNoteSetting(fileSource: FileSource, color: string | null) {
        const setting = this.settingManager.getSetting();
        const key = fileSource.filePath;
        if (color === null) {
            delete setting[key];
        } else if (isColor(color)) {
            setting[key] = color;
        }
        this.settingManager.setSetting(setting);
    }
    static async getColorNote(fileSource: FileSource) {
        const isAppFile = checkIsAppFile(fileSource.fileName);
        if (!isAppFile) {
            return this.getColorNoteSetting(fileSource);
        }
        const json = await readJsonData(fileSource);
        if (json === null) {
            return;
        }
        const color = json.metadata?.colorNote;
        if (isColor(color)) {
            return color;
        }
        return null;
    }
    static async setColorNote(
        fileSource: FileSource, color: string | null,
    ) {
        const isAppFile = checkIsAppFile(fileSource.fileName);
        if (!isAppFile) {
            this.setColorNoteSetting(fileSource, color);
            return;
        }
        const json = await readJsonData(fileSource);
        if (json === null) {
            return;
        }
        json.metadata = json.metadata ?? {};
        json.metadata.colorNote = color;
        return fileSource.saveData(JSON.stringify(json));
    }
    static unsetColorNote(fileSource: FileSource, isSetting = false) {
        if (isSetting) {
            this.setColorNoteSetting(fileSource, null);
            return;
        }
        this.setColorNote(fileSource, null);
    }
    static async checkAllColorNotes() {
        const setting = this.settingManager.getSetting();
        for (const key in setting) {
            try {
                if (await fsCheckFileExist(key)) {
                    continue;
                }
            } catch (error) {
                handleError(error);
            }
            delete setting[key];
        }
        this.settingManager.setSetting(setting);
    }
}
