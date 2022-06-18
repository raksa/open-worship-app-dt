import { useEffect } from 'react';
import { ToolingType } from '../slide-editor/helps';
import {
    getSetting, useStateSettingNumber,
} from '../helper/settingHelper';
import SlideItem from '../slide-presenting/SlideItem';
import EventHandler from './EventHandler';
import HTML2ReactChild from '../slide-editor/HTML2ReactChild';

type ListenerType<T> = (data: T) => void;
export enum SlideListEnum {
    SLIDE_ITEM_SELECT = 'slide-item-select',
    BOX_EDITING = 'box-editing',
    SLIDE_ITEM_SIZING = 'slide-item-sizing',
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
    tooling(data: ToolingType) {
        this._addPropEvent(SlideListEnum.TOOLING, data);
    }
    selectSlideItem(slideItem: SlideItem | null) {
        this._addPropEvent(SlideListEnum.SLIDE_ITEM_SELECT, slideItem);
    }
    slideItemSizing() {
        this._addPropEvent(SlideListEnum.SLIDE_ITEM_SIZING);
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

export function useSlideItemSelecting(listener: ListenerType<SlideItem | null>) {
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            SlideListEnum.SLIDE_ITEM_SELECT, listener);
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
export function useSlideItemTooling(listener: ListenerType<ToolingType>) {
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            SlideListEnum.TOOLING, listener);
        return () => {
            slideListEventListenerGlobal.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideItemSizing(settingName: string, defaultSize: number): [number, (s: number) => void] {
    const getDefaultSize = () => +getSetting(settingName, defaultSize + '');
    const [thumbnailSize, setThumbnailSize] = useStateSettingNumber(settingName, getDefaultSize());
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            SlideListEnum.SLIDE_ITEM_SIZING, () => setThumbnailSize(getDefaultSize()));
        return () => {
            slideListEventListenerGlobal.unregisterSlideListEventListener(event);
        };
    });
    const applyThumbnailSize = (size: number) => {
        setThumbnailSize(size);
        slideListEventListenerGlobal.slideItemSizing();
    };
    return [thumbnailSize, applyThumbnailSize];
}
