import ScreenManager from '../ScreenManager';
import { showAppContextMenu } from '../../others/AppContextMenu';

export function openContextMenu(event: any, screenManager: ScreenManager) {
    const isOne = ScreenManager.getAllInstances().length === 1;
    const { screenFTManager } = screenManager;
    const isShowingFT = !!screenFTManager.ftItemData;
    const isLineSync = screenFTManager.isLineSync;
    const extraMenuItems = isShowingFT ? [{
        menuTitle: `${isLineSync ? 'Un' : ''}Set Line Sync`,
        onClick() {
            screenFTManager.isLineSync = !isLineSync;
        },
    }] : [];
    showAppContextMenu(event, [
        ...isOne ? [] : [{
            menuTitle: 'Solo',
            onClick() {
                ScreenManager.getSelectedInstances()
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
                screenManager.delete();
            },
        }],
        ...extraMenuItems,
    ]);
}
