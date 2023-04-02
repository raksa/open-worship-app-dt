import { useAppEffect } from './debuggerHelpers';
import DirSource, {
    DirSourceEventType,
} from './DirSource';
import FileSource, { FSEventType } from './FileSource';
import { useRefresh } from './helpers';

export function useDSEvents(events: DirSourceEventType[],
    dirSource?: DirSource,
    callback?: () => void) {
    useAppEffect(() => {
        const update = () => {
            callback?.();
        };
        const instanceEvents = dirSource?.registerEventListener(
            events, update) || [];
        const staticEvents = DirSource.registerEventListener(events, update);
        return () => {
            dirSource?.unregisterEventListener(instanceEvents);
            DirSource.unregisterEventListener(staticEvents);
        };
    }, [dirSource]);
}

export function useFSEvents(events: FSEventType[],
    fileSource?: FileSource,
    callback?: () => void) {
    const refresh = useRefresh();
    useAppEffect(() => {
        const update = () => {
            refresh();
            callback?.();
        };
        const instanceEvents = fileSource?.registerEventListener(
            events, update) || [];
        const staticEvents = FileSource.registerEventListener(
            events, update);
        return () => {
            fileSource?.unregisterEventListener(instanceEvents);
            FileSource.unregisterEventListener(staticEvents);
        };
    }, [fileSource]);
}
