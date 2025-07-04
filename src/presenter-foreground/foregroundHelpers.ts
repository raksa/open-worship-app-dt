import ScreenForegroundManager from '../_screen/managers/ScreenForegroundManager';
import { getForegroundDataListOnScreenSetting } from '../_screen/screenHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { getScreenManagerBaseByKey } from '../_screen/managers/screenManagerBaseHelpers';
import { screenManagerFromBase } from '../_screen/managers/screenManagerHelpers';
import { ForegroundDataType } from '../_screen/screenTypeHelpers';

export function getShowingScreenIdDataList(
    filterFunc: (data: ForegroundDataType) => boolean,
) {
    const allForegroundDataList = getForegroundDataListOnScreenSetting();
    const showingScreenIdDataList = Object.entries(allForegroundDataList)
        .filter(([_, data]) => {
            return filterFunc(data);
        })
        .map(([key, data]) => {
            return [parseInt(key), data] as [number, ForegroundDataType];
        });
    return showingScreenIdDataList;
}

export function getScreenForegroundManagerInstances(
    screenId: number,
    callback: (screenForegroundManager: ScreenForegroundManager) => void,
) {
    const screenManager = screenManagerFromBase(
        getScreenManagerBaseByKey(screenId.toString()),
    );
    if (screenManager === null) {
        showSimpleToast('ScreenManager not found', 'error');
        return;
    }
    const { screenForegroundManager } = screenManager;
    callback(screenForegroundManager);
}
