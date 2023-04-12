import { useState } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';
import ReadingBibleController, {
    ReadingBibleEventType,
} from './ReadingBibleController';

export function useReadingBibleEvents(events: ReadingBibleEventType[],
    callback?: () => void) {
    const readingBibleController = ReadingBibleController.getInstance();
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        const instanceEvents = readingBibleController.registerEventListener(
            events, update);
        return () => {
            readingBibleController.unregisterEventListener(instanceEvents);
        };
    }, [n]);
}
