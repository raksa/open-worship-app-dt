import { useEffect } from 'react';
import {
    getSetting, useStateSettingNumber,
} from '../helper/settingHelper';
import SlideItem from '../slide-list/SlideItem';
import EventHandler, { ListenerType } from './EventHandler';

export type SlideListEventType = 'slide-item-select' | 'slide-item-sizing';

export default class SlideListEventListener extends EventHandler<SlideListEventType> {
    static eventNamePrefix: string = 'slide-list';
    static selectSlideItem(slideItem: SlideItem | null) {
        this.addPropEvent('slide-item-select', slideItem);
    }
    static slideItemSizing() {
        this.addPropEvent('slide-item-sizing');
    }
}

export function useSlideItemSelecting(listener: ListenerType<SlideItem | null>) {
    useEffect(() => {
        const event = SlideListEventListener.registerEventListener(
            ['slide-item-select'], listener);
        return () => {
            SlideListEventListener.unregisterEventListener(event);
        };
    });
}
export function useSlideItemSizing(settingName: string, defaultSize: number)
    : [number, (s: number) => void] {
    const getDefaultSize = () => +getSetting(settingName, defaultSize.toString());
    const [thumbnailSize, setThumbnailSize] = useStateSettingNumber(settingName, getDefaultSize());
    useEffect(() => {
        const event = SlideListEventListener.registerEventListener(
            ['slide-item-sizing'], () => setThumbnailSize(getDefaultSize()));
        return () => {
            SlideListEventListener.unregisterEventListener(event);
        };
    });
    const applyThumbnailSize = (size: number) => {
        setThumbnailSize(size);
        SlideListEventListener.slideItemSizing();
    };
    return [thumbnailSize, applyThumbnailSize];
}
