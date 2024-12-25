import ScreenAlertManager from '../_screen/managers/ScreenAlertManager';
import {
    AlertDataType,
    getAlertDataListOnScreenSetting,
} from '../_screen/screenHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { getScreenManagerInstanceByKey } from '../_screen/managers/screenManagerBaseHelpers';

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
    const screenManagerBase = getScreenManagerInstanceByKey(screenId.toString());
    if (screenManagerBase === null) {
        showSimpleToast('ScreenManager not found', 'error');
        return;
    }
    const { screenAlertManager } = screenManagerBase;
    hidingFunc(screenAlertManager);
}
