import { useEffect } from 'react';
import BibleItem from '../bible-list/BibleItem';
import { setIsPreviewingBible, setIsPreviewingLyric } from '../full-text-present/FullTextPreviewer';
import Lyric from '../lyric-list/Lyric';
import Slide from '../slide-list/Slide';
import EventHandler from './EventHandler';

export enum PreviewingEnum {
    SELECT_BIBLE_ITEM = 'present-bible',
    SELECT_LYRIC = 'present-lyric',
    UPDATE_LYRIC = 'update-lyric',
    SELECT_SLIDE = 'update-slide',
    UPDATE_SLIDE = 'update-slide',
}
type ListenerType<T> = (data: T) => void | (() => void);
export type RegisteredEventType<T> = {
    type: PreviewingEnum,
    listener: ListenerType<T>,
};

export default class PreviewingEventListener extends EventHandler {
    selectBibleItem(bibleItem: BibleItem | null) {
        if (bibleItem !== null) {
            setIsPreviewingBible();
        }
        this._addPropEvent(PreviewingEnum.SELECT_BIBLE_ITEM, bibleItem);
    }
    selectLyric(lyric: Lyric | null) {
        if (lyric !== null) {
            setIsPreviewingLyric();
        }
        this._addPropEvent(PreviewingEnum.SELECT_LYRIC, lyric);
    }
    updateLyric(lyric: Lyric) {
        this._addPropEvent(PreviewingEnum.UPDATE_LYRIC, lyric);
    }
    presentSlide(slide: Slide | null) {
        this._addPropEvent(PreviewingEnum.SELECT_SLIDE, slide);
    }
    updateSlide(slide: Slide) {
        this._addPropEvent(PreviewingEnum.UPDATE_SLIDE, slide);
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

export function useBibleItemSelecting(listener: ListenerType<BibleItem | null>) {
    useEffect(() => {
        const event = previewingEventListener.registerEventListener(
            PreviewingEnum.SELECT_BIBLE_ITEM, listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useLyricSelecting(listener: ListenerType<Lyric | null>) {
    useEffect(() => {
        const event = previewingEventListener.registerEventListener(
            PreviewingEnum.SELECT_LYRIC, listener);
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
export function useSlideSelecting(listener: ListenerType<Slide | null>) {
    useEffect(() => {
        const event = previewingEventListener.registerEventListener(
            PreviewingEnum.SELECT_SLIDE, listener);
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
export function useFullTextOpening(listener: ListenerType<void>) {
    useEffect(() => {
        const eventLyric = previewingEventListener.registerEventListener(
            PreviewingEnum.SELECT_LYRIC, listener);
        const eventBible = previewingEventListener.registerEventListener(
            PreviewingEnum.SELECT_BIBLE_ITEM, listener);
        return () => {
            previewingEventListener.unregisterEventListener(eventLyric);
            previewingEventListener.unregisterEventListener(eventBible);
        };
    });
}
