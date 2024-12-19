import ScreenManager from '../ScreenManager';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../../others/AppContextMenu';

export function openContextMenu(event: any, screenManager: ScreenManager) {
    const isOne = ScreenManager.getAllInstances().length === 1;
    const { screenFullTextManager } = screenManager;
    const isShowingFT = !!screenFullTextManager.fullTextItemData;
    const isLineSync = screenFullTextManager.isLineSync;
    const extraMenuItems = isShowingFT ? [{
        menuTitle: `${isLineSync ? 'Un' : ''}Set Line Sync`,
        onClick() {
            screenFullTextManager.isLineSync = !isLineSync;
        },
    }] : [];
    const contextMenuItems: ContextMenuItemType[] = [
        ...isOne ? [] : [{
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
            menuTitle: screenManager.isSelected ? 'Unselect' : 'Select',
            onClick() {
                screenManager.isSelected = !screenManager.isSelected;
            },
        }, {
            menuTitle: 'Delete',
            onClick() {
                screenManager.clear();
            },
        }],
        ...extraMenuItems,
    ];
    if (contextMenuItems.length === 0) {
        return;
    }
    showAppContextMenu(event, contextMenuItems);
}
