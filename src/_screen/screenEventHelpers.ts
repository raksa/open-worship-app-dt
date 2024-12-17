import { useState } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import appProviderScreen from './appProviderScreen';
import ScreenBackgroundManager, {
    ScreenBackgroundManagerEventType,
} from './ScreenBackgroundManager';
import { ScreenFTManagerEventType } from './screenFullTextHelpers';
import ScreenFullTextManager from './ScreenFullTextManager';
import { ScreenMessageType } from './screenHelpers';
import ScreenManager, {
    ScreenManagerEventType,
} from './ScreenManager';
import ScreenSlideManager, {
    ScreenSlideManagerEventType,
} from './ScreenSlideManager';

export function useScreenManagerEvents(
    events: ScreenManagerEventType[], screenManager?: ScreenManager,
    callback?: () => void,
) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        let registeredEvents: any;
        const isGlobal = screenManager === undefined;
        if (isGlobal) {
            registeredEvents = ScreenManager.
                registerEventListener(events, update);
        } else {
            registeredEvents = screenManager.
                registerEventListener(events, update);
        }
        return () => {
            if (isGlobal) {
                ScreenManager.unregisterEventListener(registeredEvents);
            } else {
                screenManager.unregisterEventListener(registeredEvents);
            }
        };
    }, [screenManager, n]);
}

export function useScreenBackgroundManagerEvents(
    events: ScreenBackgroundManagerEventType[],
    screenBackgroundManager?: ScreenBackgroundManager,
    callback?: () => void,
) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        let registeredEvents: any;
        const isGlobal = screenBackgroundManager === undefined;
        if (isGlobal) {
            registeredEvents = ScreenBackgroundManager.
                registerEventListener(events, update);
        } else {
            registeredEvents = screenBackgroundManager.
                registerEventListener(events, update);
        }
        return () => {
            if (isGlobal) {
                ScreenBackgroundManager.unregisterEventListener(
                    registeredEvents,
                );
            } else {
                screenBackgroundManager.unregisterEventListener(
                    registeredEvents,
                );
            }
        };
    }, [screenBackgroundManager, n]);
}

export function useScreenSlideManagerEvents(
    events: ScreenSlideManagerEventType[],
    screenSlideManager?: ScreenSlideManager,
    callback?: () => void,
) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        let registeredEvents: any;
        const isGlobal = screenSlideManager === undefined;
        if (isGlobal) {
            registeredEvents = ScreenSlideManager.
                registerEventListener(events, update);
        } else {
            registeredEvents = screenSlideManager.registerEventListener(
                events, update,
            );
        }
        return () => {
            if (isGlobal) {
                ScreenSlideManager.unregisterEventListener(registeredEvents);
            } else {
                screenSlideManager.unregisterEventListener(registeredEvents);
            }
        };
    }, [screenSlideManager, n]);
}

export function useScreenFTManagerEvents(
    events: ScreenFTManagerEventType[], screenFTManager?: ScreenFullTextManager,
    callback?: (args: any) => void,
) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = (args: any) => {
            setN(n + 1);
            callback?.(args);
        };
        let registeredEvents: any;
        const isGlobal = screenFTManager === undefined;
        if (isGlobal) {
            registeredEvents = ScreenFullTextManager.
                registerEventListener(events, update);
        } else {
            registeredEvents = screenFTManager.
                registerEventListener(events, update);
        }
        return () => {
            if (isGlobal) {
                ScreenFullTextManager.unregisterEventListener(registeredEvents);
            } else {
                screenFTManager.unregisterEventListener(registeredEvents);
            }
        };
    }, [screenFTManager, n]);
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
}
export function initReceiveScreenMessage() {
    const channel = messageUtils.channels.screenMessageChannel;
    messageUtils.listenForData(channel, (_, message: ScreenMessageType) => {
        ScreenManager.receiveSyncScreen(message);
    });
}
