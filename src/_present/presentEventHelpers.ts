import { useState, useEffect } from 'react';
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
    useEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        const instanceEvents = presentManager?.registerEventListener(events, update) || [];
        const staticEvents = PresentManager.registerEventListener(events, update);
        return () => {
            presentManager?.unregisterEventListener(instanceEvents);
            PresentManager.unregisterEventListener(staticEvents);
        };
    }, [presentManager, n]);
}

export function usePBGMEvents(events: PresentBGManagerEventType[],
    presentBGManager?: PresentBGManager,
    callback?: () => void) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        const instanceEvents = presentBGManager?.registerEventListener(events, update) || [];
        const staticEvents = PresentBGManager.registerEventListener(events, update);
        return () => {
            presentBGManager?.unregisterEventListener(instanceEvents);
            PresentBGManager.unregisterEventListener(staticEvents);
        };
    }, [presentBGManager, n]);
}

export function usePSlideMEvents(events: PresentSlideManagerEventType[],
    presentSlideManager?: PresentSlideManager,
    callback?: () => void) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        const instanceEvents = presentSlideManager?.registerEventListener(events, update) || [];
        const staticEvents = PresentSlideManager.registerEventListener(events, update);
        return () => {
            presentSlideManager?.unregisterEventListener(instanceEvents);
            PresentSlideManager.unregisterEventListener(staticEvents);
        };
    }, [presentSlideManager, n]);
}

export function usePFTMEvents(events: PresentFTManagerEventType[],
    presentFTManager?: PresentFTManager,
    callback?: (args: any) => void) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const update = (args: any) => {
            setN(n + 1);
            callback?.(args);
        };
        const instanceEvents = presentFTManager?.registerEventListener(events, update) || [];
        const staticEvents = PresentFTManager.registerEventListener(events, update);
        return () => {
            presentFTManager?.unregisterEventListener(instanceEvents);
            PresentFTManager.unregisterEventListener(staticEvents);
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
