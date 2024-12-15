import { useState } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import appProviderScreen from './appProviderScreen';
import ScreenBGManager, {
    ScreenBGManagerEventType,
} from './ScreenBGManager';
import { ScreenFTManagerEventType } from './screenFTHelpers';
import ScreenFTManager from './ScreenFTManager';
import { ScreenMessageType } from './screenHelpers';
import ScreenManager, {
    ScreenManagerEventType,
} from './ScreenManager';
import ScreenSlideManager, {
    ScreenSlideManagerEventType,
} from './ScreenSlideManager';

export function usePMEvents(
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

export function usePBGMEvents(
    events: ScreenBGManagerEventType[], screenBGManager?: ScreenBGManager,
    callback?: () => void,
) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        let registeredEvents: any;
        const isGlobal = screenBGManager === undefined;
        if (isGlobal) {
            registeredEvents = ScreenBGManager.
                registerEventListener(events, update);
        } else {
            registeredEvents = screenBGManager.
                registerEventListener(events, update);
        }
        return () => {
            if (isGlobal) {
                ScreenBGManager.unregisterEventListener(registeredEvents);
            } else {
                screenBGManager.unregisterEventListener(registeredEvents);
            }
        };
    }, [screenBGManager, n]);
}

export function usePSlideMEvents(
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

export function usePFTMEvents(
    events: ScreenFTManagerEventType[], screenFTManager?: ScreenFTManager,
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
            registeredEvents = ScreenFTManager.
                registerEventListener(events, update);
        } else {
            registeredEvents = screenFTManager.
                registerEventListener(events, update);
        }
        return () => {
            if (isGlobal) {
                ScreenFTManager.unregisterEventListener(registeredEvents);
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
