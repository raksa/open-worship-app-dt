import {
    ContextMenuItemType, showAppContextMenu,
} from '../../others/AppContextMenu';
import appProvider from '../../server/appProvider';
import ScreenManager from '../managers/ScreenManager';

export async function chooseScreenManagerInstances(
    event: React.MouseEvent, isForceChoosing: boolean,
): Promise<ScreenManager[]> {
    if (!appProvider.isPagePresenter) {
        return [];
    }
    const selectedScreenManagers = isForceChoosing ? [] : (
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

export function getScreenManagerInstance(screenId: number) {
    const screenManager = ScreenManager.getInstance(screenId);
    if (screenManager === null) {
        const ghostScreenManager = new ScreenManager(new Date().getTime());
        ghostScreenManager.isDeleted = true;
        return createScreenManagerGhostInstance(screenId);
    }
    return screenManager;
}

export function createScreenManagerGhostInstance(screenId: number) {
    const ghostScreenManager = new ScreenManager(screenId);
    ghostScreenManager.isDeleted = true;
    return ghostScreenManager;
}

export function getAllScreenManagerInstances() {
    return [];
}
