import { createMouseEvent } from '../others/AppContextMenu';
import appProviderScreen from './appProviderScreen';
import {
    ScreenTransitionEffectType, TargetType,
} from './transition-effect/transitionEffectHelpers';

export type BoundsType = {
    x: number,
    y: number,
    width: number,
    height: number,
};
export type DisplayType = {
    id: number,
    bounds: BoundsType,
};
export type AllDisplayType = {
    primaryDisplay: DisplayType,
    displays: DisplayType[],
}

export const screenTypeList = [
    'background', 'slide', 'full-text', 'full-text-scroll',
    'full-text-text-style', 'alert',
    'full-text-selected-index', 'display-change', 'visible',
    'init', 'effect',
] as const;
export type ScreenType = typeof screenTypeList[number];
export type ScreenMessageType = {
    screenId: number,
    type: ScreenType,
    data: any,
};

const messageUtils = appProviderScreen.messageUtils;

export function calMediaSizes({
    parentWidth, parentHeight,
}: {
    parentWidth: number,
    parentHeight: number,
}, { width, height }: {
    width?: number,
    height?: number,
}) {
    if (width === undefined || height === undefined) {
        return {
            width: parentWidth,
            height: parentHeight,
            offsetH: 0,
            offsetV: 0,
        };
    }
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

type SetDisplayType = {
    screenId: number,
    displayId: number,
}
export function setDisplay({ screenId, displayId }: SetDisplayType) {
    messageUtils.sendData('main:app:set-screen-display', {
        screenId, displayId,
    });
}

export function getAllShowingScreenIds(): number[] {
    return messageUtils.sendDataSync('main:app:get-screens');
}
export function getAllDisplays(): AllDisplayType {
    return messageUtils.sendDataSync('main:app:get-displays');
}

type ShowScreenDataType = {
    screenId: number,
    displayId: number,
    replyEventName: string,
};
export function showScreen({ screenId, displayId }: SetDisplayType) {
    return new Promise<void>((resolve) => {
        const replyEventName = 'app:main-' + Date.now();
        messageUtils.listenOnceForData(replyEventName, () => {
            resolve();
        });
        const data: ShowScreenDataType = {
            screenId,
            displayId,
            replyEventName,
        };
        messageUtils.sendData('main:app:show-screen', data);
    });
}
export function hideScreen(screenId: number) {
    messageUtils.sendData('app:hide-screen', screenId);
}

export type PTEffectDataType = {
    target: TargetType,
    effect: ScreenTransitionEffectType,
};

export function genScreenMouseEvent(event?: any): MouseEvent {
    if (event) {
        return event;
    }
    const miniScreenScreen = document.getElementsByClassName(
        'mini-screen-screen',
    )[0];
    if (miniScreenScreen !== undefined) {
        const rect = miniScreenScreen.getBoundingClientRect();
        return createMouseEvent(rect.x, rect.y);
    }
    return createMouseEvent(0, 0);
}
