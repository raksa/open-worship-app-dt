import { useEffect } from 'react';
import fullTextPresentHelper from '../_present/fullTextPresentHelper';
import { getPresentRendered } from '../server/appHelper';
import { clearBackground, clearForeground } from '../helper/presentingHelpers';
import { useStateSettingBoolean } from '../helper/settingHelper';
import SlideItem from '../slide-list/SlideItem';
import EventHandler, { ListenerType } from './EventHandler';

export type PresentEventType =
    | 'render-bg'
    | 'clear-bg'
    | 'render-fg'
    | 'clear-fg'
    | 'render-ft'
    | 'clear-ft'
    | 'ctrl-scrolling'
    | 'change-bible'
    | 'display-changed';

export default class PresentEventListener extends EventHandler<PresentEventType> {
    static eventNamePrefix: string = 'present';
    renderBG() {
        this.addPropEvent('render-bg');
    }
    clearBG() {
        clearBackground();
        this.addPropEvent('clear-bg');
    }
    renderFG() {
        this.addPropEvent('render-fg');
    }
    clearFG() {
        SlideItem.setSelectedItem(null);
        clearForeground();
        this.addPropEvent('clear-fg');
    }
    renderFT() {
        this.addPropEvent('render-fg');
    }
    clearFT(isEvent?: boolean) {
        if (!isEvent) {
            fullTextPresentHelper.hide();
        }
        this.addPropEvent('clear-ft');
    }
    presentCtrlScrolling(isUp: boolean) {
        const fontSize = fullTextPresentHelper.getTextFontSize() + (isUp ? 1 : -1);
        fullTextPresentHelper.setStyle({ fontSize });
        this.addPropEvent('ctrl-scrolling', isUp);
    }
    changeBible(isNext: boolean) {
        this.addPropEvent('change-bible', isNext);
    }
    displayChanged() {
        this.addPropEvent('display-changed');
    }
}

export const presentEventListener = new PresentEventListener();

export function usePresentBGRendering() {
    const [isPresenting, setIsShowing] = useStateSettingBoolean('bgfg-control-bg');
    getPresentRendered().then((rendered) => {
        setIsShowing(!!rendered.background);
    });
    useEffect(() => {
        const eventRender = presentEventListener.registerEventListener(
            ['render-bg'], () => setIsShowing(true));
        const eventClear = presentEventListener.registerEventListener(
            ['clear-bg'], () => setIsShowing(false));
        return () => {
            presentEventListener.unregisterEventListener(eventRender);
            presentEventListener.unregisterEventListener(eventClear);
        };
    });
    return isPresenting;
}
export function usePresentBGClearing(listener: ListenerType<boolean>) {
    useEffect(() => {
        const eventClear = presentEventListener.registerEventListener(
            ['clear-bg'], listener);
        return () => {
            presentEventListener.unregisterEventListener(eventClear);
        };
    });
}
export function usePresentFGRendering() {
    const [isPresenting, setIsShowing] = useStateSettingBoolean('bgfg-control-fg');
    getPresentRendered().then((rendered) => {
        setIsShowing(!!rendered.foreground);
    });
    useEffect(() => {
        const eventRender = presentEventListener.registerEventListener(
            ['render-fg'], () => setIsShowing(true));
        const eventClear = presentEventListener.registerEventListener(
            ['clear-fg'], () => setIsShowing(false));
        return () => {
            presentEventListener.unregisterEventListener(eventRender);
            presentEventListener.unregisterEventListener(eventClear);
        };
    });
    return isPresenting;
}
export function usePresentFGClearing(listener: ListenerType<boolean>) {
    useEffect(() => {
        const eventClear = presentEventListener.registerEventListener(
            ['clear-fg'], listener);
        return () => {
            presentEventListener.unregisterEventListener(eventClear);
        };
    });
}
export function usePresentFTRendering() {
    const [isPresenting, setIsShowing] = useStateSettingBoolean('bgfg-control-ft');
    getPresentRendered().then((rendered) => {
        setIsShowing(!!rendered.fullText);
    });
    useEffect(() => {
        const eventRender = presentEventListener.registerEventListener(
            ['render-fg'], () => setIsShowing(true));
        const eventClear = presentEventListener.registerEventListener(
            ['clear-ft'], () => setIsShowing(false));
        return () => {
            presentEventListener.unregisterEventListener(eventRender);
            presentEventListener.unregisterEventListener(eventClear);
        };
    });
    return isPresenting;
}
export function usePresentFTClearing(listener: ListenerType<boolean>) {
    useEffect(() => {
        const eventClear = presentEventListener.registerEventListener(
            ['clear-ft'], listener);
        return () => {
            presentEventListener.unregisterEventListener(eventClear);
        };
    });
}
export function usePresentCtrlScrolling(listener: ListenerType<boolean>) {
    useEffect(() => {
        const event = presentEventListener.registerEventListener(
            ['ctrl-scrolling'], listener);
        return () => {
            presentEventListener.unregisterEventListener(event);
        };
    });
}
export function useChangingBible(listener: ListenerType<boolean>) {
    useEffect(() => {
        const event = presentEventListener.registerEventListener(
            ['change-bible'], listener);
        return () => {
            presentEventListener.unregisterEventListener(event);
        };
    });
}
