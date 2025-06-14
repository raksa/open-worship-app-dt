import { useScreenManagerEvents } from '../_screen/managers/screenManagerHooks';
import { useAppStateAsync } from '../helper/debuggerHelpers';

export type OptionalPromise<T> = T | Promise<T>;

export function useIsOnScreen(
    filePaths: string[],
    checkIsOnScreen: (filePaths: string[]) => Promise<boolean>,
    onUpdate?: (isOnScreen: boolean) => void,
) {
    const [isOnScreen, setIsOnScreen] = useAppStateAsync(async () => {
        const isOnScreen = await checkIsOnScreen(filePaths);
        onUpdate?.(isOnScreen);
        return isOnScreen;
    }, [filePaths]);
    useScreenManagerEvents([], undefined, async () => {
        const isOnScreen = await checkIsOnScreen(filePaths);
        onUpdate?.(isOnScreen);
        setIsOnScreen(isOnScreen);
    });
    return isOnScreen ?? false;
}
