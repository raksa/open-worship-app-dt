import { useState, useEffect } from 'react';
import { RegisteredEventType } from '../event/EventHandler';
import { AnyObjectType } from '../helper/helpers';
import appProvider from './appProvider';
import PresentBGManager, {
    PresentBGManagerEventType,
} from './PresentBGManager';
import PresentManager, {
    PresentManagerEventType,
} from './PresentManager';

export function usePMEvents(events: PresentManagerEventType[],
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
        let registerEvent: RegisteredEventType<PresentManagerEventType, void>[] = [];
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

export function usePBGMEvents(events: PresentBGManagerEventType[],
    presentBGManager?: PresentBGManager,
    callback?: () => void) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const update = () => {
            setN(n + 1);
            if (callback) {
                callback();
            }
        };
        let registerEvent: RegisteredEventType<PresentBGManagerEventType, void>[] = [];
        if (presentBGManager !== undefined) {
            registerEvent = presentBGManager.registerEventListener(
                events, update);
        } else {
            registerEvent = PresentBGManager.registerEventListener(
                events, update);
        }
        return () => {
            if (presentBGManager !== undefined) {
                presentBGManager.unregisterEventListener(registerEvent);
            } else {
                PresentBGManager.unregisterEventListener(registerEvent);
            }
        };
    }, [presentBGManager, n]);
}

export function useBGSrcList(events: PresentManagerEventType[],
    presentManager?: PresentManager) {
    usePMEvents(events, presentManager);
    return PresentBGManager.getBGSrcList();
}


export type PresentType = 'background' | 'display-change' | 'visible' | 'init';
export type PresentMessageType = {
    presentId: number,
    type: PresentType,
    data: AnyObjectType | null,
};

export function sendPresentMessage(message: PresentMessageType, isForce?: boolean) {
    if (appProvider.isPresent && !isForce) {
        return;
    }
    const channel1 = messageUtils.channels.presentMessageChannel;
    messageUtils.sendData(channel1, message);
}

const messageUtils = appProvider.messageUtils;
const channel = messageUtils.channels.presentMessageChannel;
messageUtils.listenForData(channel,
    (_, message: PresentMessageType) => {
        const { presentId, type, data } = message;
        const presentManager = PresentManager.getInstance(presentId);
        if (type === 'background') {
            presentManager.presentBGManager.bgSrc = data as any;
        } else if (type === 'visible' && data !== null) {
            presentManager.isShowing = data.isShowing;
        }
    });
if (appProvider.isPresent) {
    const presentId = PresentManager.getAllInstances()[0]?.presentId || 0;
    sendPresentMessage({
        presentId,
        type: 'init',
        data: null,
    });
}
