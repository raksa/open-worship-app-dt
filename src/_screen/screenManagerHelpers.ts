import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenu';
import ScreenManager from './ScreenManager';

export async function chooseScreenManagerInstances(event: React.MouseEvent) {
    const selectedScreenManagers = (
        ScreenManager.getSelectedScreenManagerInstances()
    );
    if (selectedScreenManagers.length > 0) {
        return selectedScreenManagers;
    }
    const screenManagers = ScreenManager.getAllInstances();
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
