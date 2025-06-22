import { appLocalStorage } from '../setting/directory-setting/appLocalStorage';

type SettingValidatorType = (value: string) => boolean;
type SettingSerializeType = (value: any) => string;
type SettingDeserializeType = (value: string) => any;
export default class SettingManager<T> {
    settingName: string;
    validate: SettingValidatorType;
    serialize: SettingSerializeType;
    deserialize: SettingDeserializeType;
    defaultValue: T;
    isErrorToDefault: boolean;
    constructor({
        settingName,
        defaultValue,
        isErrorToDefault,
        validate,
        serialize,
        deserialize,
    }: {
        settingName: string;
        defaultValue: T;
        isErrorToDefault?: boolean;
        validate?: SettingValidatorType;
        serialize?: SettingSerializeType;
        deserialize?: SettingDeserializeType;
    }) {
        this.settingName = settingName;
        this.defaultValue = defaultValue;
        this.isErrorToDefault = isErrorToDefault ?? false;
        this.validate = validate ?? (() => true);
        this.serialize = serialize ?? ((value) => value);
        this.deserialize = deserialize ?? ((value) => value);
    }
    getSetting(defaultValue?: T): T {
        defaultValue = defaultValue ?? this.defaultValue;
        const value =
            appLocalStorage.getItem(this.settingName) ??
            this.serialize(defaultValue);
        if (!this.validate(value)) {
            if (this.isErrorToDefault) {
                return defaultValue;
            }
            throw new Error(`Invalid setting value: ${value}`);
        }
        return this.deserialize(value);
    }
    setSetting(value: T) {
        if (!this.validate(this.serialize(value))) {
            throw new Error(`Invalid setting value: ${value}`);
        }
        appLocalStorage.setItem(this.settingName, this.serialize(value));
    }
}
