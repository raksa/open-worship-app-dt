import appProvider from '../server/appProvider';
import FileSource from './FileSource';
import { isColor } from './helpers';
import { SettingManager } from './settingHelper';

export default class ItemSourceMetaManager {
    static settingManager = new SettingManager<{ [key: string]: string }>({
        settingName: 'itemSourcesMeta',
        defaultValue: {},
        isErrorToDefault: true,
        validate: (jsonString) => {
            try {
                const json = JSON.parse(jsonString);
                return json instanceof Object;
            } catch (error) {
                appProvider.appUtils.handleError(error);
            }
            return false;
        },
        serialize: (json) => JSON.stringify(json),
        deserialize: (jsonString) => JSON.parse(jsonString),
    });
    static getColorNote(fileSource: FileSource): string | null {
        const setting = this.settingManager.getSetting();
        const color = setting[fileSource.filePath];
        if (isColor(color)) {
            return color;
        }
        return null;
    }
    static setColorNote(fileSource: FileSource, color: string | null) {
        const setting = this.settingManager.getSetting();
        const key = fileSource.filePath;
        if (color === null) {
            delete setting[key];
        } else if (isColor(color)) {
            setting[key] = color;
        }
        this.settingManager.setSetting(setting);
    }
}
