import ScreenOtherManager from '../_screen/managers/ScreenOtherManager';
import {
    AlertDataType,
    getAlertDataListOnScreenSetting,
} from '../_screen/screenHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { getScreenManagerBaseByKey } from '../_screen/managers/screenManagerBaseHelpers';
import { screenManagerFromBase } from '../_screen/managers/screenManagerHelpers';

export function getShowingScreenIds(
    filterFunc: (data: AlertDataType) => boolean,
) {
    const allAlertDataList = getAlertDataListOnScreenSetting();
    const showingScreenIds = Object.entries(allAlertDataList)
        .filter(([_, data]) => {
            return filterFunc(data);
        })
        .map(([key]) => {
            return parseInt(key);
        });
    return showingScreenIds;
}

export function hideAlert(
    screenId: number,
    hidingFunc: (screenOtherManager: ScreenOtherManager) => void,
) {
    const screenManager = screenManagerFromBase(
        getScreenManagerBaseByKey(screenId.toString()),
    );
    if (screenManager === null) {
        showSimpleToast('ScreenManager not found', 'error');
        return;
    }
    const { screenOtherManager } = screenManager;
    hidingFunc(screenOtherManager);
}
