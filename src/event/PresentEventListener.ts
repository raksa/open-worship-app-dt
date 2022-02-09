import { useEffect, useState } from 'react';
import fullTextPresentHelper from '../full-text-present/fullTextPresentHelper';
import { getAllDisplays } from '../helper/displayHelper';
import EventHandler from './EventHandler';

export enum PresentTypeEnum {
    DATA = 'data',
    HIDE = 'hide',
    RENDER_BG = 'render-bg',
    CLEAR_BG = 'clear-bg',
    RENDER_FG = 'render-fg',
    CLEAR_FG = 'clear-fg',
    CTRL_SCROLLING = 'ctrl-scrolling',
    CHANGE_BIBLE = 'change-bible',
    DISPLAY_CHANGED = 'displayed-changed',
}
type ListenerType<T> = (data: T) => void | (() => void);
export type RegisteredEventType<T> = {
    type: PresentTypeEnum,
    listener: ListenerType<T>,
}

export default class PresentEventListener extends EventHandler {
    fireDataEvent(data: string) {
        this._addPropEvent(PresentTypeEnum.DATA, data);
    }
    fireHideEvent() {
        this._addPropEvent(PresentTypeEnum.HIDE);
    }
    renderBG() {
        this._addPropEvent(PresentTypeEnum.RENDER_BG);
    }
    clearBG() {
        this._addPropEvent(PresentTypeEnum.CLEAR_BG);
    }
    renderFG() {
        this._addPropEvent(PresentTypeEnum.RENDER_FG);
    }
    clearFG() {
        this._addPropEvent(PresentTypeEnum.CLEAR_FG);
    }
    presentCtrlScrolling(isUp: boolean) {
        const fontSize = fullTextPresentHelper.textFontSize + (isUp ? 1 : -1);
        fullTextPresentHelper.setStyle({ fontSize });
        this._addPropEvent(PresentTypeEnum.CTRL_SCROLLING, isUp);
    }
    changeBible(isNext: boolean) {
        this._addPropEvent(PresentTypeEnum.CHANGE_BIBLE, isNext);
    }
    displayChanged() {
        this._addPropEvent(PresentTypeEnum.DISPLAY_CHANGED);
    }
    registerPresentEventListener(type: PresentTypeEnum,
        listener: ListenerType<any>): RegisteredEventType<any> {
        this._addOnEventListener(type, listener);
        return {
            type,
            listener,
        };
    }
    unregisterPresentEventListener({ type, listener }: RegisteredEventType<any>) {
        this._removeOnEventListener(type, listener);
    }
}

export const presentEventListener = new PresentEventListener();

export function usePresentDataThrowing(listener: ListenerType<string>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.DATA, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentHiding(listener: ListenerType<void>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.HIDE, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentBGRendering(listener: ListenerType<void>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.RENDER_BG, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentBGClearing(listener: ListenerType<void>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.CLEAR_BG, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentFGRendering(listener: ListenerType<void>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.RENDER_FG, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentFGClearing(listener: ListenerType<void>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.CLEAR_FG, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentCtrlScrolling(listener: ListenerType<boolean>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.CTRL_SCROLLING, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function useChangingBible(listener: ListenerType<boolean>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.CHANGE_BIBLE, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function useDisplay() {
    const [displays, setDisplays] = useState(getAllDisplays());
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.DISPLAY_CHANGED, () => setDisplays(getAllDisplays()));
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
    return displays;
}
