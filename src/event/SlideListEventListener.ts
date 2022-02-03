import { useEffect } from "react";
import { HTML2ReactChildType } from "../editor/slideParser";
import { SlideItemThumbType, ToolingType } from "../editor/slideType";
import EventHandler from "./EventHandler";

type ListenerType<T> = (data: T) => void;
export enum SlideListEnum {
    SELECT = 'select',
    ITEM_THUMB_SELECT = 'item-thumb-select',
    BOX_EDITING = 'box-editing',
    UPDATE_ITEM_THUMB = 'update-item-thumb',
    ITEM_THUMB_ORDERING = 'item-thumb-ordering',
    TOOLING = 'tooling',
};
export type RegisteredEventType<T> = {
    type: SlideListEnum,
    listener: ListenerType<T>,
};
export default class SlideListEventListener extends EventHandler {
    selectSlideItem(filePath: string | null) {
        this._addPropEvent(SlideListEnum.SELECT, filePath);
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
    registerSlideListEventListener(type: SlideListEnum, listener: ListenerType<any>):
        RegisteredEventType<any> {
        this._addOnEventListener(type, listener);
        return {
            type,
            listener,
        };
    }
    unregisterSlideListEventListener({ type, listener }: RegisteredEventType<any>) {
        this._removeOnEventListener(type, listener);
    }
}

export const slideListEventListener = new SlideListEventListener();

export function useSlideSelecting(listener: ListenerType<string | null>) {
    useEffect(() => {
        const event = slideListEventListener.registerSlideListEventListener(
            SlideListEnum.SELECT, listener);
        return () => {
            slideListEventListener.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideItemThumbSelecting(listener: ListenerType<SlideItemThumbType | null>) {
    useEffect(() => {
        const event = slideListEventListener.registerSlideListEventListener(
            SlideListEnum.ITEM_THUMB_SELECT, listener);
        return () => {
            slideListEventListener.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideItemThumbUpdating(listener: ListenerType<SlideItemThumbType>) {
    useEffect(() => {
        const event = slideListEventListener.registerSlideListEventListener(
            SlideListEnum.UPDATE_ITEM_THUMB, listener);
        return () => {
            slideListEventListener.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideItemThumbOrdering(listener: ListenerType<void>) {
    useEffect(() => {
        const event = slideListEventListener.registerSlideListEventListener(
            SlideListEnum.ITEM_THUMB_ORDERING, listener);
        return () => {
            slideListEventListener.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideBoxEditing(listener: ListenerType<HTML2ReactChildType | null>) {
    useEffect(() => {
        const event = slideListEventListener.registerSlideListEventListener(
            SlideListEnum.BOX_EDITING, listener);
        return () => {
            slideListEventListener.unregisterSlideListEventListener(event);
        };
    });
}
export function useSlideItemThumbTooling(listener: ListenerType<ToolingType>) {
    useEffect(() => {
        const event = slideListEventListener.registerSlideListEventListener(
            SlideListEnum.TOOLING, listener);
        return () => {
            slideListEventListener.unregisterSlideListEventListener(event);
        };
    });
}
