import { useEffect } from "react";
import fullTextPresentHelper from "../full-text-present/fullTextPresentHelper";
import EventHandler from "./EventHandler";

export enum PresentTypeEnum {
    Data = 'data',
    Hide = 'hide',
    RenderBG = 'render-bg',
    ClearBG = 'clear-bg',
    RenderFG = 'render-fg',
    ClearFG = 'clear-fg',
    CtrlScrolling = 'ctrl-scrolling',
    ChangeBible = 'change-bible',
}
type ListenerType<T> = (data: T) => void | (() => void);
export type RegisteredEventType<T> = {
    type: PresentTypeEnum,
    listener: ListenerType<T>,
}

export default class PresentEventListener extends EventHandler {
    fireDataEvent(data: string) {
        this._addPropEvent(PresentTypeEnum.Data, data);
    }
    fireHideEvent() {
        this._addPropEvent(PresentTypeEnum.Hide);
    }
    renderBG() {
        this._addPropEvent(PresentTypeEnum.RenderBG);
    }
    clearBG() {
        this._addPropEvent(PresentTypeEnum.ClearBG);
    }
    renderFG() {
        this._addPropEvent(PresentTypeEnum.RenderFG);
    }
    clearFG() {
        this._addPropEvent(PresentTypeEnum.ClearFG);
    }
    presentCtrlScrolling(isUp: boolean) {
        const fontSize = fullTextPresentHelper.textFontSize + (isUp ? 1 : -1);
        fullTextPresentHelper.setStyle({ fontSize });
        this._addPropEvent(PresentTypeEnum.CtrlScrolling, isUp);
    }
    changeBible(isNext: boolean) {
        this._addPropEvent(PresentTypeEnum.ChangeBible, isNext);
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
            PresentTypeEnum.Data, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentHiding(listener: ListenerType<void>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.Hide, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentBGRendering(listener: ListenerType<void>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.RenderBG, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentBGClearing(listener: ListenerType<void>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.ClearBG, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentFGRendering(listener: ListenerType<void>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.RenderFG, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentFGClearing(listener: ListenerType<void>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.ClearFG, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function usePresentCtrlScrolling(listener: ListenerType<boolean>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.CtrlScrolling, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
export function useChangingBible(listener: ListenerType<boolean>) {
    useEffect(() => {
        const event = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.ChangeBible, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(event);
        };
    });
}
