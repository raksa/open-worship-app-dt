import { useState } from 'react';

import { useAppEffect } from '../../helper/debuggerHelpers';
import appProviderScreen from '../appProviderScreen';
import ScreenBackgroundManager, {
    ScreenBackgroundManagerEventType,
} from './ScreenBackgroundManager';
import { ScreenFTManagerEventType } from '../screenFullTextHelpers';
import ScreenFullTextManager from './ScreenFullTextManager';
import { ScreenMessageType } from '../screenHelpers';
import ScreenManager, { ScreenManagerEventType } from './ScreenManager';
import ScreenSlideManager, {
    ScreenSlideManagerEventType,
} from './ScreenSlideManager';
import EventHandler from '../../event/EventHandler';
import ScreenAlertManager, {
    ScreenAlertEventType,
} from './ScreenAlertManager';
import ScreenManagerBase from './ScreenManagerBase';
import {
    applyScreenManagerSyncScreen, syncScreenManagerGroup,
} from './screenManagerHelpers';

function useScreenEvents<T extends string>(
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

export function useScreenManagerEvents(
    events: ScreenManagerEventType[], screenManagerBase?: ScreenManagerBase,
    callback?: () => void,
) {
    useScreenEvents(events, ScreenManager as any, screenManagerBase, callback);
    useScreenBackgroundManagerEvents(['update']);
    useScreenSlideManagerEvents(['update']);
    useScreenFullTextManagerEvents(['update']);
    useScreenAlertManagerEvents(['update']);
}

const messageUtils = appProviderScreen.messageUtils;
export function sendScreenMessage(
    message: ScreenMessageType, isForce?: boolean,
) {
    if (appProviderScreen.isScreen && !isForce) {
        return;
    }
    const channel = messageUtils.channels.screenMessageChannel;
    const isSent = messageUtils.sendDataSync(channel, {
        ...message,
        isScreen: appProviderScreen.isScreen,
    });
    console.assert(isSent, JSON.stringify({ channel, message }));
    syncScreenManagerGroup(message);
}
export function initReceiveScreenMessage() {
    const channel = messageUtils.channels.screenMessageChannel;
    messageUtils.listenForData(channel, (_, message: ScreenMessageType) => {
        applyScreenManagerSyncScreen(message);
    });
}
