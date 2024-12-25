import ScreenManager from '../managers/ScreenManager';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../../others/AppContextMenu';
import {
    getAllScreenManagerInstances,
    getSelectedScreenManagerInstances,
} from '../managers/screenManagerBaseHelpers';

export function openContextMenu(event: any, screenManagerBase: ScreenManagerBase) {
    const screenManagers = getAllScreenManagerInstances();
    const selectedScreenIds = screenManagers.filter((screenManager1) => {
        return screenManager1.isSelected;
    }).map((screenManager1) => {
        return screenManager1.screenId;
    });
    const isSolo = (
        selectedScreenIds.length === 1 &&
        selectedScreenIds.includes(screenManagerBase.screenId)
    );
    const isOne = screenManagers.length === 1;
    const { screenFullTextManager } = screenManagerBase;
    const isShowingFT = !!screenFullTextManager.fullTextItemData;
    const isLineSync = screenFullTextManager.isLineSync;
    const extraMenuItems = isShowingFT ? [{
        menuTitle: `${isLineSync ? 'Un' : ''}Set Line Sync`,
        onClick() {
            screenFullTextManager.isLineSync = !isLineSync;
        },
    }] : [];
    const menuItems: ContextMenuItemType[] = [
        ...isOne || isSolo ? [] : [{
            menuTitle: 'Solo',
            onClick() {
                getSelectedScreenManagerInstances()
                    .forEach((screenManager1) => {
                        screenManager1.isSelected = false;
                    });
                screenManagerBase.isSelected = true;
            },
        }],
        ...isOne ? [] : [{
            menuTitle: screenManagerBase.isSelected ? 'Deselect' : 'Select',
            onClick() {
                screenManagerBase.isSelected = !screenManagerBase.isSelected;
            },
        }, {
            menuTitle: 'Delete',
            onClick() {
                screenManagerBase.delete();
            },
        }],
        ...extraMenuItems,
    ];
    if (menuItems.length === 0) {
        return;
    }
    showAppContextMenu(event, menuItems);
}
