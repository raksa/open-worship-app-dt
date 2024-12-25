import { screenManagerSettingNames } from '../../helper/constants';
import { log } from '../../helper/loggerHelpers';
import { getSetting, setSetting } from '../../helper/settingHelpers';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../../others/AppContextMenu';
import { unlocking } from '../../server/appHelpers';
import appProvider from '../../server/appProvider';
import {
    getAllDisplays, getAllShowingScreenIds, getScreenManagersInstanceSetting,
    ScreenMessageType, TypeScreenManagerSettingType,
} from '../screenHelpers';
import ScreenAlertManager from './ScreenAlertManager';
import ScreenBackgroundManager from './ScreenBackgroundManager';
import ScreenEffectManager from './ScreenEffectManager';
import ScreenFullTextManager from './ScreenFullTextManager';
import ScreenSlideManager from './ScreenSlideManager';
import ScreenManagerBase from './ScreenManagerBase';
import { initNewScreenManagerInstance } from './screenManagerHelpers';
import ScreenManager from './ScreenManager';
import { createContext, use } from 'react';

export const SCREEN_MANAGER_SETTING_NAME = 'screen-display-';
const cache = new Map<string, ScreenManager>();

export async function chooseScreenManagerInstances(
    event: React.MouseEvent, isForceChoosing: boolean,
): Promise<ScreenManager[]> {
    if (!appProvider.isPagePresenter) {
        return [];
    }
    const selectedScreenManagers = isForceChoosing ? [] : (
        getSelectedScreenManagerInstances()
    );
    if (selectedScreenManagers.length > 0) {
        return selectedScreenManagers;
    }
    const screenManagers = getAllScreenManagerInstances();
    return new Promise<ScreenManager[]>((resolve) => {
        const menuItems: ContextMenuItemType[] = screenManagers.map(
            (screenManagerBase) => {
                return {
                    menuTitle: screenManagerBase.name,
                    onClick: () => {
                        resolve([screenManagerBase]);
                    },
                };
            },
        );
        showAppContextMenu(event as any, menuItems).then(() => {
            resolve([]);
        });
    });
}

export function getScreenManagerInstanceForce(screenId: number) {
    const screenManagerBase = getScreenManagerInstance(screenId);
    if (screenManagerBase === null) {
        return createScreenManagerGhostInstance(screenId);
    }
    return screenManagerBase;
}

export function createScreenManagerGhostInstance(screenId: number) {
    const ghostScreenManager = initNewScreenManagerInstance(screenId);
    ghostScreenManager.isDeleted = true;
    return ghostScreenManager;
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

function getSyncGroupScreenEventHandler(message: ScreenMessageType) {
    const { type } = message;
    if (type === 'background') {
        return ScreenBackgroundManager;
    } else if (type === 'slide') {
        return ScreenSlideManager;
    } else if (type === 'full-text') {
        return ScreenFullTextManager;
    } else if (type === 'alert') {
        return ScreenAlertManager;
    }
    return null;
}

export function applyScreenManagerSyncScreen(message: ScreenMessageType) {
    const ScreenHandler = getSyncGroupScreenEventHandler(message);
    if (ScreenHandler !== null) {
        return ScreenHandler.receiveSyncScreen(message);
    }
    const { type, data, screenId } = message;
    const screenManagerBase = getScreenManagerInstance(screenId);
    if (screenManagerBase === null) {
        return;
    }
    if (type === 'init') {
        screenManagerBase.sendSyncScreen();
    } else if (type === 'visible') {
        screenManagerBase.isShowing = data?.isShowing;
    } else if (type === 'effect') {
        ScreenEffectManager.receiveSyncScreen(message);
    } else if (type === 'full-text-scroll') {
        ScreenFullTextManager.receiveSyncScroll(message);
    } else if (type === 'full-text-selected-index') {
        ScreenFullTextManager.receiveSyncSelectedIndex(message);
    } else if (type === 'full-text-text-style') {
        ScreenFullTextManager.receiveSyncTextStyle(message);
    } else {
        log(message);
    }
}

export function getSelectedScreenManagerInstances() {
    return Array.from(cache.values()).filter((screenManagerBase) => {
        return screenManagerBase.isSelected;
    });
}

export function getScreenManagersSetting() {
    const instanceSetting = getScreenManagersInstanceSetting();
    if (instanceSetting.length > 0) {
        instanceSetting.forEach(({ screenId, isSelected }: any) => {
            if (typeof screenId === 'number') {
                const screenManagerBase = createScreenManagerInstance(screenId);
                screenManagerBase._isSelected = !!isSelected;
            }
        });
    } else {
        createScreenManagerInstance(0);
    }
    const screenManagers = getAllScreenManagerInstances();
    if (screenManagers.length === 1) {
        screenManagers[0]._isSelected = true;
    }
    return screenManagers;
}

export function saveScreenManagersSetting(deletedScreenId?: number) {
    return unlocking(
        screenManagerSettingNames.MANAGERS, async () => {
            const newInstanceSetting: TypeScreenManagerSettingType[] = [];
            for (const screenManagerBase of getAllScreenManagerInstances()) {
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

export function getScreenManagerInstanceByKey(key: string) {
    const screenId = parseInt(key);
    return getScreenManagerInstance(screenId);
}

export function getAllScreenManagerInstances(): ScreenManager[] {
    let cachedInstances = Array.from(cache.values());
    if (cachedInstances.length === 0) {
        cachedInstances = getAllShowingScreenIds().map((screenId) => {
            return createScreenManagerInstance(screenId);
        });
    }
    return cachedInstances.filter((screenManagerBase) => {
        return !screenManagerBase.isDeleted;
    });
}

async function getAllScreenManagerInstancesByColorNote(
    colorNote: string | null, excludeScreenIds: number[] = [],
): Promise<ScreenManagerBase[]> {
    if (colorNote === null) {
        return [];
    }
    const allInstances = getAllScreenManagerInstances();
    const instances: ScreenManagerBase[] = [];
    for (const screenManagerBase of allInstances) {
        if (excludeScreenIds.includes(screenManagerBase.screenId)) {
            continue;
        }
        const note = await screenManagerBase.getColorNote();
        if (note === colorNote) {
            instances.push(screenManagerBase);
        }
    }
    return instances;
}

export function createScreenManagerInstance(screenId: number) {
    const key = screenId.toString();
    if (!cache.has(key)) {
        const screenManagerBase = initNewScreenManagerInstance(screenId);
        cache.set(key, screenManagerBase);
        saveScreenManagersSetting();
        screenManagerBase.fireUpdateEvent();
        const {
            screenBackgroundManager, screenSlideManager,
            screenFullTextManager, screenAlertManager,
        } = screenManagerBase;
        screenBackgroundManager.fireUpdateEvent();
        screenSlideManager.fireUpdateEvent();
        screenFullTextManager.fireUpdateEvent();
        screenAlertManager.fireUpdateEvent();
    }
    return cache.get(key) as ScreenManager;
}

export function getScreenManagerInstance(screenId: number) {
    const key = screenId.toString();
    if (cache.has(key)) {
        return cache.get(key) as ScreenManager;
    }
    return null;
}

export function genNewScreenManagerInstance() {
    const screenManagers = getAllScreenManagerInstances();
    const screenIds = screenManagers.map((screenManagerBase) => {
        return screenManagerBase.screenId;
    });
    let newScreenId = 0;
    while (screenIds.includes(newScreenId)) {
        newScreenId++;
    }
    createScreenManagerInstance(newScreenId);
    ScreenManagerBase.fireInstanceEvent();
}

export async function syncScreenManagerGroup(message: ScreenMessageType) {
    const currentScreenManager = getScreenManagerInstance(
        message.screenId,
    );
    if (currentScreenManager === null || currentScreenManager.isDeleted) {
        return;
    }
    const colorNote = await currentScreenManager.getColorNote();
    const screenManagers = await getAllScreenManagerInstancesByColorNote(
        colorNote, [currentScreenManager.screenId],
    );
    screenManagers.forEach((screenManagerBase) => {
        const newMessage: ScreenMessageType = {
            ...message,
            screenId: screenManagerBase.screenId,
        };
        const ScreenHandler = getSyncGroupScreenEventHandler(
            newMessage,
        );
        if (ScreenHandler !== null) {
            if (!currentScreenManager.checkIsSyncGroupEnabled(
                ScreenHandler,
            )) {
                return;
            }
            ScreenHandler.disableSyncGroup(currentScreenManager.screenId);
            ScreenHandler.receiveSyncScreen(newMessage);
        }
    });
}

export function deleteScreenManagerCache(key: string) {
    cache.delete(key);
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
