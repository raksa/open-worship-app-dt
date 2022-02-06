import { useEffect } from 'react';
import { HTML2ReactChildType } from '../editor/slideParser';
import { SlideItemThumbType, ToolingType } from '../helper/slideHelper';
import EventHandler from './EventHandler';

type ListenerType<T> = (data: T) => void;
export enum SlideListEnum {
    SELECT = 'select',
    ITEM_THUMB_SELECT = 'item-thumb-select',
    BOX_EDITING = 'box-editing',
    UPDATE_ITEM_THUMB = 'update-item-thumb',
    ITEM_THUMB_ORDERING = 'item-thumb-ordering',
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
    boxEditing(data: HTML2ReactChildType | null) {
        this._addPropEvent(SlideListEnum.BOX_EDITING, data);
    }
    ordering() {
        this._addPropEvent(SlideListEnum.ITEM_THUMB_ORDERING);
    }
    tooling(data: ToolingType) {
        this._addPropEvent(SlideListEnum.TOOLING, data);
    }
    selectSlideItemThumb(slideItemThumb: SlideItemThumbType | null) {
        this._addPropEvent(SlideListEnum.ITEM_THUMB_SELECT, slideItemThumb);
    }
    updateSlideItemThumb(slideItemThumb: SlideItemThumbType) {
        this._addPropEvent(SlideListEnum.UPDATE_ITEM_THUMB, slideItemThumb);
    }
    refresh() {
        this._addPropEvent(SlideListEnum.REFRESH);
    }
    registerSlideListEventListener(type: SlideListEnum, listener: ListenerType<any>):
        RegisteredEventType<any> {
        this._addOnEventListener(type, listener);
        return { type, listener };
    }
    unregisterSlideListEventListener({ type, listener }: RegisteredEventType<any>) {
        this._removeOnEventListener(type, listener);
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
export function useSlideItemThumbSelecting(listener: ListenerType<SlideItemThumbType | null>) {
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            SlideListEnum.ITEM_THUMB_SELECT, listener);
        return () => {
            slideListEventListenerGlobal.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideItemThumbUpdating(listener: ListenerType<SlideItemThumbType>) {
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            SlideListEnum.UPDATE_ITEM_THUMB, listener);
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
export function useSlideBoxEditing(listener: ListenerType<HTML2ReactChildType | null>) {
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
            slideListEventListenerGlobal.unregisterSlideListEventListener(event);
        };
    });
}
