import ScreenManager from '../ScreenManager';
import { showAppContextMenu } from '../../others/AppContextMenu';

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
    showAppContextMenu(event, [
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
        ...[{
            menuTitle: screenManager.isSelected ? 'Unselect' : 'Select',
            onClick() {
                screenManager.isSelected = !screenManager.isSelected;
            },
        }],
        ...isOne ? [] : [{
            menuTitle: 'Delete',
            onClick() {
                screenManager.clear();
            },
        }],
        ...extraMenuItems,
    ]);
}
