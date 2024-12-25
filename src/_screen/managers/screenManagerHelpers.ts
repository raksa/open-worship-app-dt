import ScreenManager from './ScreenManager';
import {
    getScreenManagerInstanceForce, useScreenManagerBaseContext,
} from './screenManagerBaseHelpers';

export function initNewScreenManagerInstance(screenId: number) {
    return new ScreenManager(screenId);
}

export function useScreenManagerContext(): ScreenManager {
    const screenManagerBase = useScreenManagerBaseContext();
    return getScreenManagerInstanceForce(screenManagerBase.screenId);
}
