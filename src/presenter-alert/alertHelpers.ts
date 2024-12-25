import ScreenAlertManager from '../_screen/managers/ScreenAlertManager';
import {
    AlertDataType,
    getAlertDataListOnScreenSetting,
} from '../_screen/screenHelpers';
import ScreenManager from '../_screen/managers/ScreenManager';
import { showSimpleToast } from '../toast/toastHelpers';

export function getShowingScreenIds(
    filterFunc: (data: AlertDataType) => boolean,
) {
    const allAlertDataList = getAlertDataListOnScreenSetting();
    const showingScreenIds = (
        Object.entries(allAlertDataList).filter(([_, data]) => {
            return filterFunc(data);
        }).map(([key]) => {
            return parseInt(key);
        })
    );
    return showingScreenIds;
}


export function hideAlert(
    screenId: number,
    hidingFunc: (screenAlertManager: ScreenAlertManager) => void,
) {
    const screenManager = ScreenManager.getInstanceByKey(
        screenId.toString(),
    );
    if (screenManager === null) {
        showSimpleToast('ScreenManager not found', 'error');
        return;
    }
    const { screenAlertManager } = screenManager;
    hidingFunc(screenAlertManager);
}
