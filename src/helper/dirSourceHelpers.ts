import { useState } from 'react';
import { useAppEffect } from './debuggerHelpers';
import DirSource, {
    DirSourceEventType,
} from './DirSource';
import FileSource, { FSEventType } from './FileSource';

export function useDSEvents(events: DirSourceEventType[],
    dirSource?: DirSource,
    callback?: () => void) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        const instanceEvents = dirSource?.registerEventListener(
            events, update) ?? [];
        const staticEvents = DirSource.registerEventListener(events, update);
        return () => {
            dirSource?.unregisterEventListener(instanceEvents);
            DirSource.unregisterEventListener(staticEvents);
        };
    }, [dirSource, n]);
}

export function useFSEvents(events: FSEventType[],
    fileSource?: FileSource,
    callback?: () => void) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        const instanceEvents = fileSource?.registerEventListener(
            events, update) ?? [];
        const staticEvents = FileSource.registerEventListener(
            events, update);
        return () => {
            fileSource?.unregisterEventListener(instanceEvents);
            FileSource.unregisterEventListener(staticEvents);
        };
    }, [fileSource, n]);
}
