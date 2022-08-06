import { useState, useEffect } from 'react';
import PresentManager, {
    PMEventType,
    RegisteredEventType,
} from './PresentManager';

export function usePMEvents(events: PMEventType[],
    presentManager?: PresentManager,
    callback?: () => void) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const update = () => {
            setN(n + 1);
            if (callback) {
                callback();
            }
        };
        let registerEvent: RegisteredEventType<any>[] = [];
        if (presentManager !== undefined) {
            registerEvent = presentManager.registerEventListener(
                events, update);
        } else {
            registerEvent = PresentManager.registerEventListener(
                events, update);
        }
        return () => {
            if (presentManager !== undefined) {
                presentManager.unregisterEventListener(registerEvent);
            } else {
                PresentManager.unregisterEventListener(registerEvent);
            }
        };
    }, [presentManager, n]);
}

export function useBGSrcList(events: PMEventType[],
    presentManager?: PresentManager) {
    usePMEvents(events, presentManager);
    return PresentManager.getBGSrcList();
}
