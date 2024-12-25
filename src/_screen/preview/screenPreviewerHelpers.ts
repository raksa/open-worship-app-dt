import ScreenManager from '../managers/ScreenManager';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../../others/AppContextMenu';

export function openContextMenu(event: any, screenManager: ScreenManager) {
    const screenManagers = ScreenManager.getAllInstances();
    const selectedScreenIds = screenManagers.filter((screenManager1) => {
        return screenManager1.isSelected;
    }).map((screenManager1) => {
        return screenManager1.screenId;
    });
    const isSolo = (
        selectedScreenIds.length === 1 &&
        selectedScreenIds.includes(screenManager.screenId)
    );
    const isOne = screenManagers.length === 1;
    const { screenFullTextManager } = screenManager;
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
                ScreenManager.getSelectedScreenManagerInstances()
                    .forEach((screenManager1) => {
                        screenManager1.isSelected = false;
                    });
                screenManager.isSelected = true;
            },
        }],
        ...isOne ? [] : [{
            menuTitle: screenManager.isSelected ? 'Deselect' : 'Select',
            onClick() {
                screenManager.isSelected = !screenManager.isSelected;
            },
        }, {
            menuTitle: 'Delete',
            onClick() {
                screenManager.delete();
            },
        }],
        ...extraMenuItems,
    ];
    if (menuItems.length === 0) {
        return;
    }
    showAppContextMenu(event, menuItems);
}
