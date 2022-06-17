import { useEffect } from 'react';
import { ToolingType } from '../editor/helps';
import {
    getSetting, setSetting, useStateSettingNumber,
} from '../helper/settingHelper';
import HTML2ReactChild from '../slide-editing/HTML2ReactChild';
import SlideItem from '../slide-presenting/SlideItem';
import { THUMB_SELECTED_SETTING_NAME } from '../slide-presenting/SlideItemsControllerBase';
import EventHandler from './EventHandler';

type ListenerType<T> = (data: T) => void;
export enum SlideListEnum {
    ITEM_THUMB_SELECT = 'item-thumb-select',
    BOX_EDITING = 'box-editing',
    ITEM_THUMB_ORDERING = 'item-thumb-ordering',
    ITEM_THUMB_SIZING = 'item-thumb-sizing',
    TOOLING = 'tooling',
}
export type RegisteredEventType<T> = {
    type: SlideListEnum,
    listener: ListenerType<T>,
};
export default class SlideListEventListener extends EventHandler {
    boxEditing(data: HTML2ReactChild | null) {
        this._addPropEvent(SlideListEnum.BOX_EDITING, data);
    }
    ordering() {
        this._addPropEvent(SlideListEnum.ITEM_THUMB_ORDERING);
    }
    tooling(data: ToolingType) {
        this._addPropEvent(SlideListEnum.TOOLING, data);
    }
    selectSlideItemThumb(slideItemThumb: SlideItem | null) {
        this._addPropEvent(SlideListEnum.ITEM_THUMB_SELECT, slideItemThumb);
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

export function useSlideItemThumbSelecting(listener: ListenerType<SlideItem | null>) {
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
