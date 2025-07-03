import ScreenForegroundManager from '../_screen/managers/ScreenForegroundManager';
import { getForegroundDataListOnScreenSetting } from '../_screen/screenHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { getScreenManagerBaseByKey } from '../_screen/managers/screenManagerBaseHelpers';
import { screenManagerFromBase } from '../_screen/managers/screenManagerHelpers';
import { ForegroundDataType } from '../_screen/screenTypeHelpers';

export function getShowingScreenIds(
    filterFunc: (data: ForegroundDataType) => boolean,
) {
    const allForegroundDataList = getForegroundDataListOnScreenSetting();
    const showingScreenIds = Object.entries(allForegroundDataList)
        .filter(([_, data]) => {
            return filterFunc(data);
        })
        .map(([key]) => {
            return parseInt(key);
        });
    return showingScreenIds;
}

export function getScreenManagerInstances(
    screenId: number,
    hidingFunc: (screenForegroundManager: ScreenForegroundManager) => void,
) {
    const screenManager = screenManagerFromBase(
        getScreenManagerBaseByKey(screenId.toString()),
    );
    if (screenManager === null) {
        showSimpleToast('ScreenManager not found', 'error');
        return;
    }
    const { screenForegroundManager } = screenManager;
    hidingFunc(screenForegroundManager);
}
