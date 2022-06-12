import { useEffect } from 'react';
import { ToolingType } from '../editor/Tools';
import { getSetting, setSetting, useStateSettingNumber } from '../helper/settingHelper';
import { HTML2ReactChild } from '../helper/slideHelper';
import SlideItemThumb from '../slide-presenting/SlideItemThumb';
import { THUMB_SELECTED_SETTING_NAME } from '../slide-presenting/SlideThumbsController';
import EventHandler from './EventHandler';

type ListenerType<T> = (data: T) => void;
export enum SlideListEnum {
    SELECT = 'select',
    ITEM_THUMB_SELECT = 'item-thumb-select',
    BOX_EDITING = 'box-editing',
    ITEM_THUMB_ORDERING = 'item-thumb-ordering',
    ITEM_THUMB_SIZING = 'item-thumb-sizing',
    TOOLING = 'tooling',
    REFRESH = 'refresh',
}
export type RegisteredEventType<T> = {
    type: SlideListEnum,
    listener: ListenerType<T>,
};
export default class SlideListEventListener extends EventHandler {
    selecting() {
        this._addPropEvent(SlideListEnum.SELECT);
    }
    boxEditing(data: HTML2ReactChild | null) {
        this._addPropEvent(SlideListEnum.BOX_EDITING, data);
    }
    ordering() {
        this._addPropEvent(SlideListEnum.ITEM_THUMB_ORDERING);
    }
    tooling(data: ToolingType) {
        this._addPropEvent(SlideListEnum.TOOLING, data);
    }
    selectSlideItemThumb(slideItemThumb: SlideItemThumb | null) {
        this._addPropEvent(SlideListEnum.ITEM_THUMB_SELECT, slideItemThumb);
    }
    refresh() {
        this._addPropEvent(SlideListEnum.REFRESH);
    }
    thumbSizing() {
        this._addPropEvent(SlideListEnum.ITEM_THUMB_SIZING);
    }
    registerSlideListEventListener(type: SlideListEnum, listener: ListenerType<any>):
        RegisteredEventType<any> {
        this._addOnEventListener(type, listener);
        return { type, listener };
    }
    unregisterSlideListEventListener({ type, listener }: RegisteredEventType<any>) {
        this._removeOnEventListener(type, listener);
    }
    clearSelectSlideItemThumb() {
        setSetting(THUMB_SELECTED_SETTING_NAME, '');
    }
}
export const slideListEventListenerGlobal = new SlideListEventListener();

export function useSlideSelecting(listener: ListenerType<void>) {
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            SlideListEnum.SELECT, listener);
        return () => {
            slideListEventListenerGlobal.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideItemThumbSelecting(listener: ListenerType<SlideItemThumb | null>) {
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            SlideListEnum.ITEM_THUMB_SELECT, listener);
        return () => {
            slideListEventListenerGlobal.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideItemThumbOrdering(listener: ListenerType<void>) {
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            SlideListEnum.ITEM_THUMB_ORDERING, listener);
        return () => {
            slideListEventListenerGlobal.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideBoxEditing(listener: ListenerType<HTML2ReactChild | null>) {
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            SlideListEnum.BOX_EDITING, listener);
        return () => {
            slideListEventListenerGlobal.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideItemThumbTooling(listener: ListenerType<ToolingType>) {
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            SlideListEnum.TOOLING, listener);
        return () => {
            slideListEventListenerGlobal.unregisterSlideListEventListener(event);
        };
    });
}
export function useRefreshing(slideListEventListener: SlideListEventListener,
    listener: ListenerType<void>) {
    useEffect(() => {
        const event = slideListEventListener.registerSlideListEventListener(
            SlideListEnum.REFRESH, listener);
        return () => {
            slideListEventListener.unregisterSlideListEventListener(event);
        };
    });
}
export function useThumbSizing(settingName: string, defaultSize: number): [number, (s: number) => void] {
    const getDefaultSize = () => +getSetting(settingName, defaultSize + '');
    const [thumbSize, setThumbSize] = useStateSettingNumber(settingName, getDefaultSize());
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            SlideListEnum.ITEM_THUMB_SIZING, () => setThumbSize(getDefaultSize()));
        return () => {
            slideListEventListenerGlobal.unregisterSlideListEventListener(event);
        };
    });
    const applyThumbSize = (size: number) => {
        setThumbSize(size);
        slideListEventListenerGlobal.thumbSizing();
    };
    return [thumbSize, applyThumbSize];
}
