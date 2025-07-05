import ScreenForegroundManager from '../_screen/managers/ScreenForegroundManager';
import { getForegroundDataListOnScreenSetting } from '../_screen/screenHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { getScreenManagerBaseByKey } from '../_screen/managers/screenManagerBaseHelpers';
import { screenManagerFromBase } from '../_screen/managers/screenManagerHelpers';
import {
    ForegroundDataType,
    ForegroundSrcListType,
} from '../_screen/screenTypeHelpers';

export function getForegroundShowingScreenIdDataList(
    filterFunc: (
        data: ForegroundDataType,
        allForegroundDataList: ForegroundSrcListType,
    ) => boolean,
) {
    const allForegroundDataList = getForegroundDataListOnScreenSetting();
    const showingScreenIdDataList = Object.entries(allForegroundDataList)
        .map(([key, data]) => {
            return [
                parseInt(key),
                ScreenForegroundManager.parseAllForegroundData(data),
            ] as [number, ForegroundDataType];
        })
        .filter(([_, data]) => {
            return filterFunc(data, allForegroundDataList);
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
