import { useState } from 'react';

export function setSetting(key: string, value: string) {
    localStorage.setItem(key, value);
}
export function getSetting(key: string, defaultValue?: string): string {
    const value = localStorage.getItem(key);
    if (value === null) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        return '';
    }
    return value;
}

export function useStateSettingBoolean(
    settingName: string, defaultValue?: boolean,
) {
    const defaultData = (
        (getSetting(settingName) ?? 'false') !== 'false' || !!defaultValue
    );
    const [data, setData] = useState(defaultData);
    const setDataSetting = (b: boolean) => {
        setData(b);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting] as [boolean, (b: boolean) => void];
}
export function useStateSettingString<T extends string>(
    settingName: string, defaultString: T,
) {
    const defaultData = (getSetting(settingName) ?? defaultString) ?? '';
    const [data, setData] = useState<T>(defaultData as T);
    const setDataSetting = (b: string) => {
        setData(b as T);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting] as [T, (t: T) => void];
}
export function useStateSettingNumber(settingName: string
    , defaultNumber: number): [number, (n: number) => void] {
    const defaultData = +(getSetting(settingName) ?? NaN);
    const [data, setData] = useState(
        isNaN(defaultData) ? defaultNumber : defaultData,
    );
    const setDataSetting = (b: number) => {
        setData(b);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting];
}

type SettingValidatorType = (value: string) => boolean;
type SettingSerializeType = (value: any) => string;
type SettingDeserializeType = (value: string) => any;
export class SettingManager<T> {
    settingName: string;
    validate: SettingValidatorType;
    serialize: SettingSerializeType;
    deserialize: SettingDeserializeType;
    defaultValue: T;
    isErrorToDefault: boolean;
    constructor({
        settingName, defaultValue, isErrorToDefault,
        validate, serialize, deserialize,

    }: {
        settingName: string,
        defaultValue: T,
        isErrorToDefault?: boolean,
        validate?: SettingValidatorType,
        serialize?: SettingSerializeType,
        deserialize?: SettingDeserializeType,
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
        const value = getSetting(this.settingName,
            this.serialize(defaultValue));
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
        setSetting(this.settingName, this.serialize(value));
    }
}
