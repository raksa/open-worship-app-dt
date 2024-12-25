import { screenManagerSettingNames } from '../../helper/constants';
import { getSetting } from '../../helper/settingHelpers';
import { getAllDisplays } from '../screenHelpers';
import ScreenManagerBase from './ScreenManagerBase';
import { createContext, use } from 'react';
import { isValidJson } from '../../helper/helpers';

export const SCREEN_MANAGER_SETTING_NAME = 'screen-display-';
export const screenManagerBaseCache = new Map<string, ScreenManagerBase>();

export function setScreenManagerBaseCache(
    screenManagerBase: ScreenManagerBase,
) {
    screenManagerBaseCache.set(screenManagerBase.key, screenManagerBase);
}

export function getScreenManagersInstanceSetting(): {
    screenId: number,
    isSelected: boolean,
    colorNote: string | null,
}[] {
    const str = getSetting(screenManagerSettingNames.MANAGERS, '');
    if (isValidJson(str, true)) {
        const json = JSON.parse(str);
        let instanceSettingList = json.filter(({ screenId }: any) => {
            return typeof screenId === 'number';
        });
        instanceSettingList = instanceSettingList.filter(
            (value: any, index: number, self: any) => {
                return self.findIndex(
                    (t: any) => {
                        return t.screenId === value.screenId;
                    },
                ) === index;
            },
        );
        return instanceSettingList;
    }
    return [];
}


export function getDefaultScreenDisplay() {
    const { primaryDisplay, displays } = getAllDisplays();
    return displays.find((display) => {
        return display.id !== primaryDisplay.id;
    }) || primaryDisplay;
}

export function getDisplayById(displayId: number) {
    const { displays } = getAllDisplays();
    return displays.find((display) => {
        return display.id === displayId;
    })?.id ?? 0;
}

export function getDisplayByScreenId(screenId: number) {
    const displayId = getDisplayIdByScreenId(screenId);
    const { displays } = getAllDisplays();
    return displays.find((display) => {
        return display.id === displayId;
    }) || getDefaultScreenDisplay();
}

export function getDisplayIdByScreenId(screenId: number) {
    const defaultDisplay = getDefaultScreenDisplay();
    const str = getSetting(`${SCREEN_MANAGER_SETTING_NAME}-pid-${screenId}`,
        defaultDisplay.id.toString());
    if (isNaN(parseInt(str))) {
        return defaultDisplay.id;
    }
    const id = parseInt(str);
    const { displays } = getAllDisplays();
    return displays.find((display) => {
        return display.id === id;
    })?.id ?? defaultDisplay.id;
}

export function getSelectedScreenManagerBases() {
    return Array.from(screenManagerBaseCache.values()).filter(
        (screenManagerBase) => {
            return screenManagerBase.isSelected;
        },
    );
}

export function getScreenManagerBaseByKey(key: string) {
    const screenId = parseInt(key);
    return getScreenManagerBase(screenId);
}

export function getScreenManagerBase(screenId: number) {
    const key = screenId.toString();
    if (screenManagerBaseCache.has(key)) {
        return screenManagerBaseCache.get(key) ?? null;
    }
    return null;
}

export function deleteScreenManagerBaseCache(key: string) {
    screenManagerBaseCache.delete(key);
}

export const ScreenManagerBaseContext = (
    createContext<ScreenManagerBase | null>(null)
);
export function useScreenManagerBaseContext(): ScreenManagerBase {
    const screenManagerBase = use(ScreenManagerBaseContext);
    if (screenManagerBase === null) {
        throw new Error(
            'useScreenManager must be used within a ScreenManagerBase ' +
            'Context Provider',
        );
    }
    return screenManagerBase;
}
