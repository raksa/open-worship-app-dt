import { screenManagerSettingNames } from '../../helper/constants';
import { log } from '../../helper/loggerHelpers';
import { setSetting } from '../../helper/settingHelpers';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../../others/AppContextMenu';
import { unlocking } from '../../server/appHelpers';
import appProvider from '../../server/appProvider';
import {
    TypeScreenManagerSettingType, ScreenMessageType, getAllShowingScreenIds,
} from '../screenHelpers';
import ScreenAlertManager from './ScreenAlertManager';
import ScreenBackgroundManager from './ScreenBackgroundManager';
import ScreenEffectManager from './ScreenEffectManager';
import ScreenFullTextManager from './ScreenFullTextManager';
import ScreenManager from './ScreenManager';
import ScreenManagerBase from './ScreenManagerBase';
import {
    getScreenManagerBase, getScreenManagersInstanceSetting,
    getSelectedScreenManagerBases, screenManagerBaseCache,
    setScreenManagerBaseCache, useScreenManagerBaseContext,
} from './screenManagerBaseHelpers';
import ScreenSlideManager from './ScreenSlideManager';

export function initNewScreenManager(screenId: number) {
    return new ScreenManager(screenId);
}

export function getScreenManagerForce(screenId: number) {
    const screenManagerBase = getScreenManagerBase(screenId);
    if (
        screenManagerBase === null ||
        !(screenManagerBase instanceof ScreenManager)
    ) {
        return createScreenManagerGhost(screenId);
    }
    return screenManagerBase;
}

export function createScreenManagerGhost(screenId: number) {
    const ghostScreenManager = initNewScreenManager(screenId);
    ghostScreenManager.isDeleted = true;
    return ghostScreenManager;
}

export function screenManagerFromBase(
    screenManagerBase: ScreenManagerBase | null,
) {
    if (
        screenManagerBase === null ||
        !(screenManagerBase instanceof ScreenManager)
    ) {
        return null;
    }
    return screenManagerBase;
}

function screenManagersFromBases(screenManagerBases: ScreenManagerBase[]) {
    return screenManagerBases.filter((screenManagerBase) => {
        return screenManagerBase instanceof ScreenManager;
    }) as any as ScreenManager[];
}

export async function chooseScreenManagers(
    event: React.MouseEvent, isForceChoosing: boolean,
): Promise<ScreenManager[]> {
    if (!appProvider.isPagePresenter) {
        return [];
    }
    const selectedScreenManagerBases = isForceChoosing ? [] : (
        getSelectedScreenManagerBases()
    );
    const selectedScreenManagers = screenManagersFromBases(
        selectedScreenManagerBases,
    );
    if (selectedScreenManagers.length > 0) {
        return selectedScreenManagers;
    }
    const screenManagers = getAllScreenManagers();
    return new Promise<ScreenManager[]>((resolve) => {
        const menuItems: ContextMenuItemType[] = screenManagers.map(
            (screenManager) => {
                return {
                    menuTitle: screenManager.name,
                    onClick: () => {
                        resolve([screenManager]);
                    },
                };
            },
        );
        showAppContextMenu(event as any, menuItems).then(() => {
            resolve([]);
        });
    });
}

export function saveScreenManagersSetting(deletedScreenId?: number) {
    return unlocking(
        screenManagerSettingNames.MANAGERS, async () => {
            const newInstanceSetting: TypeScreenManagerSettingType[] = [];
            for (const screenManager of getAllScreenManagers()) {
                const colorNote = await screenManager.getColorNote();
                newInstanceSetting.push({
                    screenId: screenManager.screenId,
                    isSelected: screenManager.isSelected,
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
    const screenManagerBase = getScreenManagerBase(screenId);
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

export async function syncScreenManagerGroup(message: ScreenMessageType) {
    const currentScreenManager = getScreenManagerBase(
        message.screenId,
    );
    if (currentScreenManager === null || currentScreenManager.isDeleted) {
        return;
    }
    const colorNote = await currentScreenManager.getColorNote();
    const screenManagers = await getAllScreenManagersByColorNote(
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


export function genNewScreenManagerBase() {
    const screenManagers = getAllScreenManagers();
    const screenIds = screenManagers.map((screenManagerBase) => {
        return screenManagerBase.screenId;
    });
    let newScreenId = 0;
    while (screenIds.includes(newScreenId)) {
        newScreenId++;
    }
    createScreenManager(newScreenId);
    ScreenManager.fireInstanceEvent();
}


async function getAllScreenManagersByColorNote(
    colorNote: string | null, excludeScreenIds: number[] = [],
): Promise<ScreenManager[]> {
    if (colorNote === null) {
        return [];
    }
    const allScreenManagers = getAllScreenManagers();
    const instances: ScreenManager[] = [];
    for (const screenManager of allScreenManagers) {
        if (excludeScreenIds.includes(screenManager.screenId)) {
            continue;
        }
        const note = await screenManager.getColorNote();
        if (note === colorNote) {
            instances.push(screenManager);
        }
    }
    return instances;
}


export function getScreenManagersSetting() {
    const instanceSetting = getScreenManagersInstanceSetting();
    if (instanceSetting.length > 0) {
        instanceSetting.forEach(({ screenId, isSelected }: any) => {
            if (typeof screenId === 'number') {
                const screenManagerBase = createScreenManager(screenId);
                screenManagerBase._isSelected = !!isSelected;
            }
        });
    } else {
        createScreenManager(0);
    }
    const screenManagers = getAllScreenManagers();
    if (screenManagers.length === 1) {
        screenManagers[0]._isSelected = true;
    }
    return screenManagers;
}

export function getAllScreenManagers(): ScreenManager[] {
    let cachedInstances = Array.from(screenManagerBaseCache.values());
    if (cachedInstances.length === 0) {
        cachedInstances = getAllShowingScreenIds().map((screenId) => {
            return createScreenManager(screenId);
        });
    }
    cachedInstances = cachedInstances.filter((screenManagerBase) => {
        return !screenManagerBase.isDeleted;
    });
    return screenManagersFromBases(cachedInstances);
}

export function createScreenManager(screenId: number) {
    const key = screenId.toString();
    if (!screenManagerBaseCache.has(key)) {
        const screenManagerBase = initNewScreenManager(screenId);
        setScreenManagerBaseCache(screenManagerBase);
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
    return screenManagerBaseCache.get(key) as ScreenManager;
}

export function useScreenManagerContext(): ScreenManager {
    const screenManagerBase = useScreenManagerBaseContext();
    if (screenManagerBase instanceof ScreenManager) {
        return screenManagerBase;
    }
    return getScreenManagerForce(screenManagerBase.screenId);
}
