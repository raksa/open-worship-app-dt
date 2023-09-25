import PresentManager from '../PresentManager';
import { showAppContextMenu } from '../../others/AppContextMenu';

export function openContextMenu(event: any, presentManager: PresentManager) {
    const isOne = PresentManager.getAllInstances().length === 1;
    const { presentFTManager } = presentManager;
    const isPresentingFT = !!presentFTManager.ftItemData;
    const isLineSync = presentFTManager.isLineSync;
    const extraMenuItems = isPresentingFT ? [{
        title: `${isLineSync ? 'Un' : ''}Set Line Sync`,
        onClick() {
            presentFTManager.isLineSync = !isLineSync;
        },
    }] : [];
    showAppContextMenu(event, [
        ...isOne ? [] : [{
            title: 'Solo',
            onClick() {
                PresentManager.getSelectedInstances()
                    .forEach((presentManager1) => {
                        presentManager1.isSelected = false;
                    });
                presentManager.isSelected = true;
            },
        }],
        ...[{
            title: presentManager.isSelected ? 'Unselect' : 'Select',
            onClick() {
                presentManager.isSelected = !presentManager.isSelected;
            },
        }],
        ...isOne ? [] : [{
            title: 'Delete',
            onClick() {
                presentManager.delete();
            },
        }],
        ...extraMenuItems,
    ]);
}
