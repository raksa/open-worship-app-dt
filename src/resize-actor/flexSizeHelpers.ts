import { CSSProperties, LazyExoticComponent } from 'react';

import { handleError } from '../helper/errorHelpers';
import { isValidJson } from '../helper/helpers';
import { setSetting, getSetting } from '../helper/settingHelpers';

export type FlexSizeType = {
    [key: string]: [string, DisabledType?],
};
export type DataInputType = {
    children: LazyExoticComponent<(props?: any) => React.JSX.Element | null> | {
        render: () => React.JSX.Element | null,
    },
    key: string,
    widgetName: string,
    className?: string,
    extraStyle?: CSSProperties,
};

export const settingPrefix = 'widget-size';
export const disablingTargetTypeList = ['first', 'second'] as const;
export type DisablingTargetType = typeof disablingTargetTypeList[number];
export type DisabledType = [DisablingTargetType, number];
export const resizeSettingNames = {
    appEditor: 'app-editor-main',
    appEditorLeft: 'app-editor-left',
    appPresenter: 'app-presenter-main',
    appPresenterLeft: 'app-presenter-left',
    appPresenterMiddle: 'app-presenter-middle',
    appPresenterRight: 'app-presenter-right',
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

export const setDisablingSetting = (
    fSizeName: string, defaultSize: FlexSizeType, dataFSizeKey: string,
    target?: DisabledType,
) => {
    const settingString = toSettingString(fSizeName);
    const flexSize = getFlexSizeSetting(fSizeName, defaultSize);
    const key = dataFSizeKeyToKey(fSizeName, dataFSizeKey);
    flexSize[key][1] = target;
    setSetting(settingString, JSON.stringify(flexSize));
    return flexSize;
};

export function clearFlexSizeSetting(fSizeName: string) {
    const settingString = toSettingString(fSizeName);
    setSetting(settingString, '');
}

export const genFlexSizeSetting = (
    fSizeName: string, defaultSize: FlexSizeType,
) => {
    const selectorString = `[data-fs^="${fSizeName}"]`;
    const collection = document.querySelectorAll<HTMLDivElement>(
        selectorString,
    );
    const items = Array.from(collection);
    const flexSize = getFlexSizeSetting(fSizeName, defaultSize);
    items.forEach((item) => {
        const dataFSizeKey = item.getAttribute('data-fs');
        if (dataFSizeKey !== null) {
            const key = dataFSizeKeyToKey(fSizeName, dataFSizeKey);
            if (flexSize[key]) {
                flexSize[key][0] = item.style.flex;
            }
        }
    });
    return flexSize;
};

export const setFlexSizeSetting = (
    fSizeName: string, flexSize: FlexSizeType,
) => {
    const settingString = toSettingString(fSizeName);
    setSetting(settingString, JSON.stringify(flexSize));
};

export function getFlexSizeSetting(
    fSizeName: string, defaultSize: FlexSizeType,
): FlexSizeType {
    const settingString = toSettingString(fSizeName);
    const str = getSetting(settingString, '');
    try {
        if (isValidJson(str, true)) {
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
        }
    } catch (error) {
        handleError(error);
    }
    setSetting(settingString, JSON.stringify(defaultSize));
    return getFlexSizeSetting(fSizeName, defaultSize);
}

function checkIsHiddenWidget(
    dataInput: DataInputType[], flexSize: FlexSizeType, index: number,
) {
    const preKey = dataInput[index]['key'];
    const preFlexSizeValue = flexSize[preKey];
    return !!preFlexSizeValue[1];
}

export function checkIsThereNotHiddenWidget(
    dataInput: DataInputType[], flexSize: FlexSizeType, startIndex: number,
    endIndex?: number,
) {
    endIndex = endIndex ?? dataInput.length - 1;
    for (let i = startIndex; i < endIndex; i++) {
        if (!checkIsHiddenWidget(dataInput, flexSize, i)) {
            return true;
        }
    }
    return false;
}

export function calcShowingHiddenWidget(
    event: any, key: string, fSizeName: string, defaultFlexSize: FlexSizeType,
    flexSizeDisabled: DisabledType,
) {
    const dataFSizeKey = keyToDataFSizeKey(fSizeName, key);
    setDisablingSetting(
        fSizeName, defaultFlexSize, dataFSizeKey,
    );
    const current = event.currentTarget;
    const target = (
        flexSizeDisabled[0] === 'first' ? current.nextElementSibling :
            current.previousElementSibling
    ) as HTMLDivElement;
    const targetFGrow = Number(target.style.flexGrow);
    const flexGrow = targetFGrow - flexSizeDisabled[1];
    target.style.flexGrow = (
        `${flexGrow < targetFGrow / 10 ? targetFGrow : flexGrow}`
    );
    const size = genFlexSizeSetting(
        fSizeName, defaultFlexSize,
    );
    return size;
}
