import { useState } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import appProviderPresent from './appProviderPresent';
import PresentBGManager, {
    PresentBGManagerEventType,
} from './PresentBGManager';
import { PresentFTManagerEventType } from './presentFTHelpers';
import PresentFTManager from './PresentFTManager';
import { PresentMessageType } from './presentHelpers';
import PresentManager, {
    PresentManagerEventType,
} from './PresentManager';
import PresentSlideManager, {
    PresentSlideManagerEventType,
} from './PresentSlideManager';

export function usePMEvents(events: PresentManagerEventType[],
    presentManager?: PresentManager,
    callback?: () => void) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        let registeredEvents: any;
        const isGlobal = presentManager === undefined;
        if (isGlobal) {
            registeredEvents = PresentManager.
                registerEventListener(events, update);
        } else {
            registeredEvents = presentManager.
                registerEventListener(events, update);
        }
        return () => {
            if (isGlobal) {
                PresentManager.unregisterEventListener(registeredEvents);
            } else {
                presentManager.unregisterEventListener(registeredEvents);
            }
        };
    }, [presentManager, n]);
}

export function usePBGMEvents(events: PresentBGManagerEventType[],
    presentBGManager?: PresentBGManager,
    callback?: () => void) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        let registeredEvents: any;
        const isGlobal = presentBGManager === undefined;
        if (isGlobal) {
            registeredEvents = PresentBGManager.
                registerEventListener(events, update);
        } else {
            registeredEvents = presentBGManager.
                registerEventListener(events, update);
        }
        return () => {
            if (isGlobal) {
                PresentBGManager.unregisterEventListener(registeredEvents);
            } else {
                presentBGManager.unregisterEventListener(registeredEvents);
            }
        };
    }, [presentBGManager, n]);
}

export function usePSlideMEvents(events: PresentSlideManagerEventType[],
    presentSlideManager?: PresentSlideManager,
    callback?: () => void) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        let registeredEvents: any;
        const isGlobal = presentSlideManager === undefined;
        if (isGlobal) {
            registeredEvents = PresentSlideManager.
                registerEventListener(events, update);
        } else {
            registeredEvents = presentSlideManager.
                registerEventListener(events, update);
        }
        return () => {
            if (isGlobal) {
                PresentSlideManager.unregisterEventListener(registeredEvents);
            } else {
                presentSlideManager.unregisterEventListener(registeredEvents);
            }
        };
    }, [presentSlideManager, n]);
}

export function usePFTMEvents(events: PresentFTManagerEventType[],
    presentFTManager?: PresentFTManager,
    callback?: (args: any) => void) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = (args: any) => {
            setN(n + 1);
            callback?.(args);
        };
        let registeredEvents: any;
        const isGlobal = presentFTManager === undefined;
        if (isGlobal) {
            registeredEvents = PresentFTManager.
                registerEventListener(events, update);
        } else {
            registeredEvents = presentFTManager.
                registerEventListener(events, update);
        }
        return () => {
            if (isGlobal) {
                PresentFTManager.unregisterEventListener(registeredEvents);
            } else {
                presentFTManager.unregisterEventListener(registeredEvents);
            }
        };
    }, [presentFTManager, n]);
}

const messageUtils = appProviderPresent.messageUtils;
export function sendPresentMessage(message: PresentMessageType,
    isForce?: boolean) {
    if (appProviderPresent.isPresent && !isForce) {
        return;
    }
    const channel = messageUtils.channels.presentMessageChannel;
    const isSent = messageUtils.sendDataSync(channel, {
        ...message,
        isPresent: appProviderPresent.isPresent,
    });
    console.assert(isSent, JSON.stringify({ channel, message }));
}
export function initReceivePresentMessage() {
    messageUtils.listenForData(
        messageUtils.channels.presentMessageChannel,
        (_, message: PresentMessageType) => {
            PresentManager.receiveSyncPresent(message);
        });
}
