import { useState } from 'react';

import { useAppEffect, useAppEffectAsync } from './debuggerHelpers';
import DirSource from './DirSource';
import FileSource, { FSEventType } from './FileSource';

export function useGenDirSource(settingName: string) {
    const [dirSource, setDirSource] = useState<DirSource | null>(null);
    useAppEffectAsync(async (methodContext) => {
        if (dirSource !== null) {
            const registeredEvent = dirSource.registerEventListener(
                ['reload'], () => {
                    methodContext.setDirSource(null);
                },
            );
            return () => {
                dirSource.unregisterEventListener(registeredEvent);
            };
        }
        const newDirSource = await DirSource.getInstance(settingName);
        methodContext.setDirSource(newDirSource);
    }, [dirSource], { setDirSource });
    return dirSource;
}

export function useFileSourceEvents<T>(
    events: FSEventType[], filePath?: string, callback?: (data: T) => void,
) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = (data: T) => {
            setN(n + 1);
            callback?.(data);
        };
        const staticEvents = FileSource.registerFSEventListener(
            events, update, filePath,
        );
        return () => {
            FileSource.unregisterEventListener(staticEvents);
        };
    }, [filePath, n]);
}
