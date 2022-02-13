import { useState } from 'react';
import { BiblePresentType } from '../full-text-present/fullTextPresentHelper';

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

export function useStateSettingBoolean(settingName: string, defaultValue?: boolean): [boolean, (b: boolean) => void] {
    const defaultData = (getSetting(settingName) || 'false') !== 'false' || !!defaultValue;
    const [data, setData] = useState(defaultData);
    const setDataSetting = (b: boolean) => {
        setData(b);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting];
}
export function useStateSettingString(settingName: string, defaultString: string): [string, (str: string) => void] {
    const defaultData = getSetting(settingName) || defaultString || '';
    const [data, setData] = useState(defaultData);
    const setDataSetting = (b: string) => {
        setData(b);
        setSetting(settingName, `${b}`);
    };
    return [data, setDataSetting];
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

export function setSlideItemSelectedSetting(filePath: string) {
    setSetting('slide-item-selected', filePath);
}
export function getSlideItemSelectedSetting() {
    return getSetting('slide-item-selected') || null;
}

export function setBiblePresentingSetting(biblePresent: BiblePresentType[]) {
    setSetting('bible-present', JSON.stringify(biblePresent));
}
export function getBiblePresentingSetting() {
    let defaultPresent: BiblePresentType[];
    try {
        defaultPresent = JSON.parse(getSetting('bible-present')) as BiblePresentType[];
    } catch (error) {
        defaultPresent = [];
    }
    return defaultPresent;
}
