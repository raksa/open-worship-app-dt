import { handleError } from '../helper/errorHelpers';
import { isValidJson } from '../helper/helpers';
import { setSetting, getSetting } from '../helper/settingHelper';
import { FlexSizeType } from './ResizeActor';

export const settingPrefix = 'widget-size';
export const disablingTargetTypeList = ['first', 'second'] as const;
export type DisablingTargetType = typeof disablingTargetTypeList[number];
export type DisabledType = [DisablingTargetType, number];
export const resizeSettingNames = {
    appEditing: 'app-editing-main',
    appEditingLeft: 'app-editing-left',
    appPresenting: 'app-presenting-main',
    appPresentingLeft: 'app-presenting-left',
    appPresentingMiddle: 'app-presenting-middle',
    appPresentingRight: 'app-presenting-right',
    fullText: 'full-text',
    slideItemEditor: 'slide-item-editor',
    read: 'read',
};

export function clearWidgetSizeSetting() {
    Object.values(resizeSettingNames).forEach((name) => {
        setSetting(`${toSettingString(name)}`, '');
    });
}
export function toSettingString(fSizeName: string) {
    return `${settingPrefix}-${fSizeName}`;
}
export function dataFSizeKeyToKey(fSizeName: string,
    dataFSizeKey: string) {
    return dataFSizeKey.replace(`${fSizeName}-`, '');
}
export function keyToDataFSizeKey(fSizeName: string, key: string) {
    return `${fSizeName}-${key}`;
}

export const setDisablingSetting = (fSizeName: string,
    defaultSize: FlexSizeType, dataFSizeKey: string,
    target?: DisabledType) => {
    const settingString = toSettingString(fSizeName);
    const flexSize = getFlexSizeSetting(fSizeName, defaultSize);
    const key = dataFSizeKeyToKey(fSizeName, dataFSizeKey);
    flexSize[key][1] = target;
    setSetting(settingString, JSON.stringify(flexSize));
    return flexSize;
};

export const setFlexSizeSetting = (fSizeName: string,
    defaultSize: FlexSizeType) => {
    const selectorString = `[data-fs^="${fSizeName}"]`;
    const collection = document.querySelectorAll<HTMLDivElement>(selectorString);
    const items = Array.from(collection);
    const settingString = toSettingString(fSizeName);
    const flexSize = getFlexSizeSetting(fSizeName, defaultSize);
    items.forEach((item) => {
        const dataFSizeKey = item.getAttribute('data-fs');
        if (dataFSizeKey !== null) {
            const key = dataFSizeKeyToKey(fSizeName, dataFSizeKey);
            flexSize[key][0] = item.style.flex;
        }
    });
    setSetting(settingString, JSON.stringify(flexSize));
    return flexSize;
};

export function getFlexSizeSetting(fSizeName: string,
    defaultSize: FlexSizeType): FlexSizeType {
    const settingString = toSettingString(fSizeName);
    const str = getSetting(settingString, '');
    try {
        if (!isValidJson(str, true)) {
            return defaultSize;
        }
        const size = JSON.parse(str);
        if (Object.keys(defaultSize).every((k) => {
            const fsValue = size[k];
            if (!fsValue || fsValue.length === 0 ||
                (fsValue[1] &&
                    !disablingTargetTypeList.includes(fsValue[1][0]) &&
                    typeof fsValue[1][1] !== 'number'
                )) {
                return false;
            }
            return true;
        })) {
            return size;
        }
    } catch (error) {
        handleError(error);
        setSetting(settingString, JSON.stringify(defaultSize));
    }
    return defaultSize;
}
