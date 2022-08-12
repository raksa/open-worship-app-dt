import { useState, useEffect } from 'react';
import { AnyObjectType } from '../helper/helpers';
import appProviderPresent from './appProviderPresent';
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

export const presentTypeList = [
    'background', 'slide', 'display-change',
    'visible', 'init',
] as const;
export type PresentType = typeof presentTypeList[number];
export type PresentMessageType = {
    presentId: number,
    type: PresentType,
    data: AnyObjectType | null,
};

export function sendPresentMessage(message: PresentMessageType, isForce?: boolean) {
    if (appProviderPresent.isPresent && !isForce) {
        return;
    }
    const channel1 = messageUtils.channels.presentMessageChannel;
    messageUtils.sendData(channel1, message);
}

const messageUtils = appProviderPresent.messageUtils;
const channel = messageUtils.channels.presentMessageChannel;
messageUtils.listenForData(channel,
    (_, message: PresentMessageType) => {
        const { presentId, type, data } = message;
        const presentManager = PresentManager.getInstance(presentId);
        if (type === 'background') {
            presentManager.presentBGManager.bgSrc = data as any;
        } else if (type === 'slide') {
            presentManager.presentSlideManager.slideItemJson = data as any;
        } else if (type === 'visible' && data !== null) {
            presentManager.isShowing = data.isShowing;
        }
    });
if (appProviderPresent.isPresent) {
    const presentId = PresentManager.getAllInstances()[0]?.presentId || 0;
    sendPresentMessage({
        presentId,
        type: 'init',
        data: null,
    });
}

export function calMediaSizes(presentManager: PresentManager,
    { width, height }: {
        width?: number,
        height?: number,
    }) {
    if (width === undefined || height === undefined) {
        return {
            width: presentManager.width,
            height: presentManager.height,
            offsetH: 0,
            offsetV: 0,
        };
    }
    const parentWidth = presentManager.width;
    const parentHeight = presentManager.height;
    const scale = Math.max(parentWidth / width,
        parentHeight / height);
    const newWidth = width * scale;
    const newHeight = height * scale;
    const offsetH = (newWidth - parentWidth) / 2;
    const offsetV = (newHeight - parentHeight) / 2;
    return {
        width: newWidth,
        height: newHeight,
        offsetH,
        offsetV,
    };
}
