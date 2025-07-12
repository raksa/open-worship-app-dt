import { useScreenUpdateEvents } from '../_screen/managers/screenManagerHooks';
import { useAppStateAsync } from '../helper/debuggerHelpers';

export type OptionalPromise<T> = T | Promise<T>;

export function useFileSourceIsOnScreen(
    filePaths: string[],
    checkIsOnScreen: (filePaths: string[]) => Promise<boolean>,
    onUpdate?: (isOnScreen: boolean) => void,
) {
    const [isOnScreen, setIsOnScreen] = useAppStateAsync(async () => {
        const isOnScreen = await checkIsOnScreen(filePaths);
        onUpdate?.(isOnScreen);
        return isOnScreen;
    }, [filePaths]);
    useScreenUpdateEvents(undefined, async () => {
        const isOnScreen = await checkIsOnScreen(filePaths);
        onUpdate?.(isOnScreen);
        setIsOnScreen(isOnScreen);
    });
    return isOnScreen ?? false;
}
