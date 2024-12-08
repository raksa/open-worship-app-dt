import { useAppEffect } from '../helper/debuggerHelpers';
import {
    getSetting, useStateSettingNumber,
} from '../helper/settingHelpers';
import {
    DEFAULT_THUMBNAIL_SIZE_FACTOR, THUMBNAIL_WIDTH_SETTING_NAME,
} from '../slide-list/slideHelpers';
import SlideItem from '../slide-list/SlideItem';
import EventHandler, { ListenerType } from './EventHandler';

export type SlideListEventType = 'slide-item-select' | 'slide-item-sizing';

export default class SlideListEventListener extends
    EventHandler<SlideListEventType> {
    static readonly eventNamePrefix: string = 'slide-list';
    static selectSlideItem(slideItem: SlideItem | null) {
        this.addPropEvent('slide-item-select', slideItem);
    }
    static slideItemSizing() {
        this.addPropEvent('slide-item-sizing');
    }
}

export function useSlideItemSelecting(
    listener: ListenerType<SlideItem | null>) {
    useAppEffect(() => {
        const event = SlideListEventListener.registerEventListener(
            ['slide-item-select'], listener,
        );
        return () => {
            SlideListEventListener.unregisterEventListener(event);
        };
    });
}

export function useSlideItemThumbnailSizeScale(
    settingName = THUMBNAIL_WIDTH_SETTING_NAME,
    defaultSize = DEFAULT_THUMBNAIL_SIZE_FACTOR,
): [number, (newScale: number) => void] {
    const getDefaultSize = () => {
        return parseInt(getSetting(settingName, defaultSize.toString()), 10);
    };
    const [thumbnailSizeScale, setThumbnailSizeScale] = useStateSettingNumber(
        settingName, getDefaultSize(),
    );
    useAppEffect(() => {
        const event = SlideListEventListener.registerEventListener(
            ['slide-item-sizing'],
            () => setThumbnailSizeScale(getDefaultSize()),
        );
        return () => {
            SlideListEventListener.unregisterEventListener(event);
        };
    });
    const applyThumbnailSizeScale = (size: number) => {
        setThumbnailSizeScale(size);
        SlideListEventListener.slideItemSizing();
    };
    return [thumbnailSizeScale, applyThumbnailSizeScale];
}
