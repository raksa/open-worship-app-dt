import { useEffect } from 'react';
import {
    getSetting, useStateSettingNumber,
} from '../helper/settingHelper';
import SlideItem from '../slide-list/SlideItem';
import EventHandler from './EventHandler';

type ListenerType<T> = (data: T) => void;
export enum SlideListEnum {
    SLIDE_ITEM_SELECT = 'slide-item-select',
    SLIDE_ITEM_SIZING = 'slide-item-sizing',
}
export type RegisteredEventType<T> = {
    type: SlideListEnum,
    listener: ListenerType<T>,
};
export default class SlideListEventListener extends EventHandler {
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
