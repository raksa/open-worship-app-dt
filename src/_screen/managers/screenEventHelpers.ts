import { useState } from 'react';

import { useAppEffect } from '../../helper/debuggerHelpers';
import ScreenBackgroundManager, {
    ScreenBackgroundManagerEventType,
} from './ScreenBackgroundManager';
import { ScreenFTManagerEventType } from '../screenFullTextHelpers';
import ScreenFullTextManager from './ScreenFullTextManager';
import ScreenVaryAppDocumentManager, {
    ScreenVaryAppDocumentManagerEventType,
} from './ScreenVaryAppDocumentManager';
import EventHandler from '../../event/EventHandler';
import ScreenAlertManager, { ScreenAlertEventType } from './ScreenAlertManager';

export function useScreenEvents<T extends string>(
    events: T[],
    Class: EventHandler<T>,
    eventHandler?: EventHandler<T>,
    callback?: (data: any) => void,
) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = (data: any) => {
            setN((n) => {
                return n + 1;
            });
            callback?.(data);
        };
        const registeredEvents =
            eventHandler?.registerEventListener(events, update) ||
            Class.registerEventListener(events, update);
        return () => {
            eventHandler?.unregisterEventListener(registeredEvents) ??
                Class.unregisterEventListener(registeredEvents);
        };
    }, [eventHandler, callback]);
    return n;
}

export function useScreenBackgroundManagerEvents(
    events: ScreenBackgroundManagerEventType[],
    screenBackgroundManager?: ScreenBackgroundManager,
    callback?: () => void,
) {
    useScreenEvents(
        events,
        ScreenBackgroundManager as any,
        screenBackgroundManager,
        callback,
    );
}

export function useScreenVaryAppDocumentManagerEvents(
    events: ScreenVaryAppDocumentManagerEventType[],
    screenVaryAppDocumentManager?: ScreenVaryAppDocumentManager,
    callback?: () => void,
) {
    useScreenEvents(
        events,
        ScreenVaryAppDocumentManager as any,
        screenVaryAppDocumentManager,
        callback,
    );
}

export function useScreenFullTextManagerEvents(
    events: ScreenFTManagerEventType[],
    screenFulTextManager?: ScreenFullTextManager,
    callback?: (args: any) => void,
) {
    useScreenEvents(
        events,
        ScreenFullTextManager as any,
        screenFulTextManager,
        callback,
    );
}

export function useScreenAlertManagerEvents(
    events: ScreenAlertEventType[],
    screenAlertManager?: ScreenAlertManager,
    callback?: () => void,
) {
    useScreenEvents(
        events,
        ScreenAlertManager as any,
        screenAlertManager,
        callback,
    );
}
