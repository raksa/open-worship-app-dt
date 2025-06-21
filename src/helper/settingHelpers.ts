import { useState } from 'react';

import appProvider from '../server/appProvider';
import { appLocalStorage } from '../setting/directory-setting/appLocalStorage';

export function setSetting(key: string, value: string) {
    // TODO: Change to use SettingManager
    appLocalStorage.setItem(key, value);
}
export function getSetting(key: string, defaultValue?: string): string {
    // TODO: Change to use SettingManager
    const value = appLocalStorage.getItem(key);
    if (value === null) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        return '';
    }
    return value;
}

export function useStateSettingBoolean(
    settingName: string,
    defaultValue?: boolean,
) {
    const originalSettingName = getSetting(settingName);
    const defaultData =
        originalSettingName === ''
            ? !!defaultValue
            : originalSettingName === 'true';
    const [data, setData] = useState(defaultData);
    const setDataSetting = (b: boolean) => {
        setData(b);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting] as [boolean, (b: boolean) => void];
}
export function useStateSettingString<T extends string>(
    settingName: string,
    defaultString: T = '' as T,
) {
    const defaultData = getSetting(settingName) || defaultString;
    const [data, setData] = useState<T>(defaultData as T);
    const setDataSetting = (b: string) => {
        setData(b as T);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting] as [T, (t: T) => void];
}
export function useStateSettingNumber(
    settingName: string,
    defaultNumber: number,
): [number, (n: number) => void] {
    const defaultData = parseInt(getSetting(settingName));
    const [data, setData] = useState(
        isNaN(defaultData) ? defaultNumber : defaultData,
    );
    const setDataSetting = (b: number) => {
        setData(b);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting];
}

export function getSettingPrefix() {
    const prefixSetting = appProvider.isPageReader ? 'reader-' : '';
    return prefixSetting;
}
