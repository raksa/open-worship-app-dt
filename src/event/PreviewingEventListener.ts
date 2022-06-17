import { useEffect } from 'react';
import { BiblePresentType } from '../full-text-present/previewingHelper';
import Lyric from '../lyric-list/Lyric';
import Slide from '../slide-list/Slide';
import EventHandler from './EventHandler';

export enum PreviewingEnum {
    ADD_BIBLE_ITEM = 'add-bible-item',
    PRESENT_BIBLE = 'present-bible',
    PRESENT_LYRIC = 'present-lyric',
    UPDATE_LYRIC = 'update-lyric',
    PRESENT_SLIDE = 'update-slide',
    UPDATE_SLIDE = 'update-slide',
    SELECT_DIR = 'select-dir',
}
type ListenerType<T> = (data: T) => void | (() => void);
export type RegisteredEventType<T> = {
    type: PreviewingEnum,
    listener: ListenerType<T>,
};

export default class PreviewingEventListener extends EventHandler {
    addBibleItem(data: { biblePresent: BiblePresentType, index?: number }) {
        this._addPropEvent(PreviewingEnum.ADD_BIBLE_ITEM, data);
    }
    presentBible(biblePresent: BiblePresentType) {
        this._addPropEvent(PreviewingEnum.PRESENT_BIBLE, biblePresent);
    }
    presentLyric(lyric: Lyric | null) {
        this._addPropEvent(PreviewingEnum.PRESENT_LYRIC, lyric);
    }
    updateLyric(lyric: Lyric) {
        this._addPropEvent(PreviewingEnum.UPDATE_LYRIC, lyric);
    }
    presentSlide(slide: Slide | null) {
        this._addPropEvent(PreviewingEnum.PRESENT_SLIDE, slide);
    }
    selectingDir(){
        this._addPropEvent(PreviewingEnum.SELECT_DIR);
    }
    updateSlide(lyric: Slide) {
        this._addPropEvent(PreviewingEnum.UPDATE_SLIDE, lyric);
    }
    registerEventListener(type: PreviewingEnum, listener: ListenerType<any>):
        RegisteredEventType<any> {
        this._addOnEventListener(type, listener);
        return {
            type,
            listener,
        };
    }
    unregisterEventListener({ type, listener }: RegisteredEventType<any>) {
        this._removeOnEventListener(type, listener);
    }
}

export const previewingEventListener = new PreviewingEventListener();

export function useBibleAdding(listener: ListenerType<{
    biblePresent: BiblePresentType, index?: number
}>) {
    useEffect(() => {
        const event = previewingEventListener.registerEventListener(
            PreviewingEnum.ADD_BIBLE_ITEM, listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useBiblePresenting(listener: ListenerType<BiblePresentType>) {
    useEffect(() => {
        const event = previewingEventListener.registerEventListener(
            PreviewingEnum.PRESENT_BIBLE, listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useLyricPresenting(listener: ListenerType<Lyric | null>) {
    useEffect(() => {
        const event = previewingEventListener.registerEventListener(
            PreviewingEnum.PRESENT_LYRIC, listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useLyricUpdating(listener: ListenerType<Lyric>) {
    useEffect(() => {
        const event = previewingEventListener.registerEventListener(
            PreviewingEnum.UPDATE_LYRIC, listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useSlidePresenting(listener: ListenerType<Slide | null>) {
    useEffect(() => {
        const event = previewingEventListener.registerEventListener(
            PreviewingEnum.PRESENT_SLIDE, listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useSlideUpdating(listener: ListenerType<Slide>) {
    useEffect(() => {
        const event = previewingEventListener.registerEventListener(
            PreviewingEnum.UPDATE_SLIDE, listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useFullTextPresenting(listener: ListenerType<void>) {
    useEffect(() => {
        const eventLyric = previewingEventListener.registerEventListener(
            PreviewingEnum.PRESENT_LYRIC, listener);
        const eventBible = previewingEventListener.registerEventListener(
            PreviewingEnum.PRESENT_BIBLE, listener);
        return () => {
            previewingEventListener.unregisterEventListener(eventLyric);
            previewingEventListener.unregisterEventListener(eventBible);
        };
    });
}
export function useOnSelectDir(listener: ListenerType<void>) {
    useEffect(() => {
        const event = previewingEventListener.registerEventListener(
            PreviewingEnum.SELECT_DIR, listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}

