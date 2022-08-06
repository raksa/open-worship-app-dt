import { useEffect } from 'react';
import {
    getSetting, useStateSettingNumber,
} from '../helper/settingHelper';
import SlideItem from '../slide-list/SlideItem';
import EventHandler from './EventHandler';

type ListenerType<T> = (data: T) => void;
export type SlideListEventType = 'slide-item-select' | 'slide-item-sizing';

export type RegisteredEventType<T> = {
    type: SlideListEventType,
    listener: ListenerType<T>,
};
export default class SlideListEventListener extends EventHandler<SlideListEventType> {
    selectSlideItem(slideItem: SlideItem | null) {
        this._addPropEvent('slide-item-select', slideItem);
    }
    slideItemSizing() {
        this._addPropEvent('slide-item-sizing');
    }
    registerSlideListEventListener(type: SlideListEventType,
        listener: ListenerType<any>):
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
            'slide-item-select', listener);
        return () => {
            slideListEventListenerGlobal.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideItemSizing(settingName: string, defaultSize: number)
    : [number, (s: number) => void] {
    const getDefaultSize = () => +getSetting(settingName, defaultSize.toString());
    const [thumbnailSize, setThumbnailSize] = useStateSettingNumber(settingName, getDefaultSize());
    useEffect(() => {
        const event = slideListEventListenerGlobal.registerSlideListEventListener(
            'slide-item-sizing', () => setThumbnailSize(getDefaultSize()));
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
