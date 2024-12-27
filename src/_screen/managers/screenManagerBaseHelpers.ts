import { screenManagerSettingNames } from '../../helper/constants';
import { getSetting, setSetting } from '../../helper/settingHelpers';
import ScreenManagerBase from './ScreenManagerBase';
import { isValidJson } from '../../helper/helpers';
import { unlocking } from '../../server/appHelpers';

export type TypeScreenManagerSettingType = {
    screenId: number,
    isSelected: boolean,
    colorNote: string | null,
};

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

export function getValidOnScreen(data: { [key: string]: any }) {
    const instanceSetting = getScreenManagersInstanceSetting();
    if (instanceSetting.length === 0) {
        return {};
    }
    const screenIdList = instanceSetting.map(({ screenId }: any) => {
        return screenId;
    });
    const validEntry = Object.entries(data).filter(([key, _]) => {
        return screenIdList.includes(parseInt(key));
    });
    return Object.fromEntries(validEntry);
}

export function saveScreenManagersSetting(
    allScreenManagerBases: ScreenManagerBase[], deletedScreenId?: number,
) {
    return unlocking(
        screenManagerSettingNames.MANAGERS, async () => {
            const newInstanceSetting: TypeScreenManagerSettingType[] = [];
            for (const screenManagerBase of allScreenManagerBases) {
                const colorNote = await screenManagerBase.getColorNote();
                newInstanceSetting.push({
                    screenId: screenManagerBase.screenId,
                    isSelected: screenManagerBase.isSelected,
                    colorNote,
                });
            }
            let instanceSetting = getScreenManagersInstanceSetting();
            instanceSetting = instanceSetting.map((item) => {
                return newInstanceSetting.find((newItem) => {
                    return newItem.screenId === item.screenId;
                }) || item;
            });
            for (const newItem of newInstanceSetting) {
                if (!instanceSetting.some((item) => {
                    return item.screenId === newItem.screenId;
                })) {
                    instanceSetting.push(newItem);
                }
            }
            if (deletedScreenId !== undefined) {
                instanceSetting = instanceSetting.filter((item) => {
                    return item.screenId !== deletedScreenId;
                });
            }
            setSetting(
                screenManagerSettingNames.MANAGERS,
                JSON.stringify(instanceSetting),
            );
        },
    );
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

export function getAllScreenManagerBases(): ScreenManagerBase[] {
    return Array.from(screenManagerBaseCache.values());
}
