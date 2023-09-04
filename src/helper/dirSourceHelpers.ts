import { useState } from 'react';
import { useAppEffect } from './debuggerHelpers';
import DirSource, {
    DirSourceEventType,
} from './DirSource';
import FileSource, { FSEventType } from './FileSource';

export function useGenDS(settingName: string) {
    const [dirSource, setDirSource] = useState<DirSource | null>(null);
    useAppEffect(() => {
        if (dirSource !== null) {
            return;
        }
        DirSource.getInstance(settingName).then((newDirSource) => {
            newDirSource.registerEventListener(['reload'], () => {
                setDirSource(null);
            });
            setDirSource(newDirSource);
        });
    }, [dirSource]);
    return dirSource;
}

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

export function useFSEvents(
    events: FSEventType[], filePath?: string, callback?: () => void,
) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        const staticEvents = FileSource.registerFSEventListener(
            events, update, filePath,
        );
        return () => {
            FileSource.unregisterEventListener(staticEvents);
        };
    }, [filePath, n]);
}
