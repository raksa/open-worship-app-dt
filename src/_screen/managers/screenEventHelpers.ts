import { useState } from 'react';

import { useAppEffect } from '../../helper/debuggerHelpers';
import ScreenBackgroundManager, {
    ScreenBackgroundManagerEventType,
} from './ScreenBackgroundManager';
import { ScreenFTManagerEventType } from '../screenFullTextHelpers';
import ScreenFullTextManager from './ScreenFullTextManager';
import ScreenSlideManager, {
    ScreenSlideManagerEventType,
} from './ScreenSlideManager';
import EventHandler from '../../event/EventHandler';
import ScreenAlertManager, {
    ScreenAlertEventType,
} from './ScreenAlertManager';

export function useScreenEvents<T extends string>(
    events: T[], Class: EventHandler<T>,
    eventHandler?: EventHandler<T>, callback?: (data: any) => void,
) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = (data: any) => {
            setN((n) => {
                return n + 1;
            });
            callback?.(data);
        };
        const registeredEvents = (
            eventHandler?.registerEventListener(events, update) ||
            Class.registerEventListener(events, update)
        );
        return () => {
            (
                eventHandler?.unregisterEventListener(registeredEvents) ??
                Class.unregisterEventListener(registeredEvents)
            );
        };
    }, [eventHandler]);
    return n;
}

export function useScreenBackgroundManagerEvents(
    events: ScreenBackgroundManagerEventType[],
    screenBackgroundManager?: ScreenBackgroundManager,
    callback?: () => void,
) {
    useScreenEvents(
        events, ScreenBackgroundManager as any, screenBackgroundManager,
        callback,
    );
}

export function useScreenSlideManagerEvents(
    events: ScreenSlideManagerEventType[],
    screenSlideManager?: ScreenSlideManager,
    callback?: () => void,
) {
    useScreenEvents(
        events, ScreenSlideManager as any, screenSlideManager, callback,
    );
}

export function useScreenFullTextManagerEvents(
    events: ScreenFTManagerEventType[],
    screenFulTextManager?: ScreenFullTextManager,
    callback?: (args: any) => void,
) {
    useScreenEvents(
        events, ScreenFullTextManager as any, screenFulTextManager, callback,
    );
}

export function useScreenAlertManagerEvents(
    events: ScreenAlertEventType[], screenAlertManager?: ScreenAlertManager,
    callback?: () => void,
) {
    useScreenEvents(
        events, ScreenAlertManager as any, screenAlertManager, callback,
    );
}
