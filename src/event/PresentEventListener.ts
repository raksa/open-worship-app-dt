import { useEffect, useState } from 'react';
import fullTextPresentHelper from '../full-text-present/previewingHelper';
import { getPresentRendered } from '../helper/appHelper';
import { getAllDisplays } from '../helper/displayHelper';
import { clearBackground, clearForeground } from '../helper/presentingHelpers';
import { useStateSettingBoolean } from '../helper/settingHelper';
import SlideItem from '../slide-presenting/SlideItem';
import EventHandler from './EventHandler';
import { slideListEventListenerGlobal } from './SlideListEventListener';

export enum PresentTypeEnum {
    DATA = 'data',
    HIDE = 'hide',
    RENDER_BG = 'render-bg',
    CLEAR_BG = 'clear-bg',
    RENDER_FG = 'render-fg',
    CLEAR_FG = 'clear-fg',
    RENDER_FT = 'render-ft',
    CLEAR_FT = 'clear-ft',
    CTRL_SCROLLING = 'ctrl-scrolling',
    CHANGE_BIBLE = 'change-bible',
    DISPLAY_CHANGED = 'displayed-changed',
}
type AsyncListenerType<T> = ((data: T) => Promise<void>) | (() => Promise<void>);
type ListenerType<T> = ((data: T) => void) | (() => void);
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
        clearBackground();
        this._addPropEvent(PresentTypeEnum.CLEAR_BG);
    }
    renderFG() {
        this._addPropEvent(PresentTypeEnum.RENDER_FG);
    }
    clearFG() {
        SlideItem.clearSelectedSlideItem();
        clearForeground();
        this._addPropEvent(PresentTypeEnum.CLEAR_FG);
    }
    renderFT() {
        this._addPropEvent(PresentTypeEnum.RENDER_FT);
    }
    clearFT(isEvent?: boolean) {
        if (!isEvent) {
            fullTextPresentHelper.hide();
        }
        this._addPropEvent(PresentTypeEnum.CLEAR_FT);
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
export function usePresentBGRendering() {
    const [isPresenting, setIsShowing] = useStateSettingBoolean('bgfg-control-bg');
    getPresentRendered().then((rendered) => {
        setIsShowing(!!rendered.background);
    });
    useEffect(() => {
        const eventRender = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.RENDER_BG, () => setIsShowing(true));
        const eventClear = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.CLEAR_BG, () => setIsShowing(false));
        return () => {
            presentEventListener.unregisterPresentEventListener(eventRender);
            presentEventListener.unregisterPresentEventListener(eventClear);
        };
    });
    return isPresenting;
}
export function usePresentBGClearing(listener: ListenerType<boolean>) {
    useEffect(() => {
        const eventClear = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.CLEAR_BG, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(eventClear);
        };
    });
}
export function usePresentFGRendering() {
    const [isPresenting, setIsShowing] = useStateSettingBoolean('bgfg-control-fg');
    getPresentRendered().then((rendered) => {
        setIsShowing(!!rendered.foreground);
    });
    useEffect(() => {
        const eventRender = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.RENDER_FG, () => setIsShowing(true));
        const eventClear = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.CLEAR_FG, () => setIsShowing(false));
        return () => {
            presentEventListener.unregisterPresentEventListener(eventRender);
            presentEventListener.unregisterPresentEventListener(eventClear);
        };
    });
    return isPresenting;
}
export function usePresentFGClearing(listener: ListenerType<boolean>) {
    useEffect(() => {
        const eventClear = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.CLEAR_FG, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(eventClear);
        };
    });
}
export function usePresentFTRendering() {
    const [isPresenting, setIsShowing] = useStateSettingBoolean('bgfg-control-ft');
    getPresentRendered().then((rendered) => {
        setIsShowing(!!rendered.fullText);
    });
    useEffect(() => {
        const eventRender = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.RENDER_FT, () => setIsShowing(true));
        const eventClear = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.CLEAR_FT, () => setIsShowing(false));
        return () => {
            presentEventListener.unregisterPresentEventListener(eventRender);
            presentEventListener.unregisterPresentEventListener(eventClear);
        };
    });
    return isPresenting;
}
export function usePresentFTClearing(listener: ListenerType<boolean>) {
    useEffect(() => {
        const eventClear = presentEventListener.registerPresentEventListener(
            PresentTypeEnum.CLEAR_FT, listener);
        return () => {
            presentEventListener.unregisterPresentEventListener(eventClear);
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
export function useChangingBible(listener: AsyncListenerType<boolean>) {
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
