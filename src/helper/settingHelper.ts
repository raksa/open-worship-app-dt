import { useState } from 'react';
import { BiblePresentType } from '../full-text-present/previewingHelper';

export function setSetting(key: string, value: string) {
    window.localStorage.setItem(key, value);
}
export function getSetting(key: string, defaultValue?: string): string {
    const value = window.localStorage.getItem(key);
    if (value === null) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        return '';
    }
    return value;
}

export function useStateSettingBoolean(settingName: string, defaultValue?: boolean) {
    const defaultData = (getSetting(settingName) || 'false') !== 'false' || !!defaultValue;
    const [data, setData] = useState(defaultData);
    const setDataSetting = (b: boolean) => {
        setData(b);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting] as [boolean, (b: boolean) => void];
}
export function useStateSettingString<T extends string>(settingName: string, defaultString: T) {
    const defaultData = getSetting(settingName) || defaultString || '';
    const [data, setData] = useState<T>(defaultData as T);
    const setDataSetting = (b: string) => {
        setData(b as T);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting] as [T, (t: T) => void];
}
export function useStateSettingNumber(settingName: string, defaultNumber: number): [number, (n: number) => void] {
    const defaultData = +(getSetting(settingName) || NaN);
    const [data, setData] = useState(isNaN(defaultData) ? defaultNumber : defaultData);
    const setDataSetting = (b: number) => {
        setData(b);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting];
}
