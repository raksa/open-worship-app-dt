import { useEffect } from 'react';
import {
    BiblePresentType as FullTextPresentType,
} from '../full-text-present/fullTextPresentHelper';
import { LyricPresentType } from '../lyric-list/LyricList';
import EventHandler from './EventHandler';

export enum FullTextPresentEnum {
    ADD_BIBLE_ITEM = 'add-bible-item',
    PRESENT_BIBLE = 'present-bible',
    PRESENT_LYRIC = 'present-lyric',
    UPDATE_LYRIC = 'update-lyric',
}
type ListenerType<T> = (data: T) => void | (() => void);
export type RegisteredEventType<T> = {
    type: FullTextPresentEnum,
    listener: ListenerType<T>,
};

export default class FullTextPresentEventListener extends EventHandler {
    addBibleItem(data: { biblePresent: FullTextPresentType, index?: number }) {
        this._addPropEvent(FullTextPresentEnum.ADD_BIBLE_ITEM, data);
    }
    presentBible(biblePresent: FullTextPresentType) {
        this._addPropEvent(FullTextPresentEnum.PRESENT_BIBLE, biblePresent);
    }
    presentLyric(lyricPresents: LyricPresentType[]) {
        this._addPropEvent(FullTextPresentEnum.PRESENT_LYRIC, lyricPresents);
    }
    updateLyric(lyricPresents: LyricPresentType[]) {
        this._addPropEvent(FullTextPresentEnum.UPDATE_LYRIC, lyricPresents);
    }
    registerEventListener(type: FullTextPresentEnum, listener: ListenerType<any>):
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

export const fullTextPresentEventListener = new FullTextPresentEventListener();

export function useBibleAdding(listener: ListenerType<{
    biblePresent: FullTextPresentType, index?: number
}>) {
    useEffect(() => {
        const event = fullTextPresentEventListener.registerEventListener(
            FullTextPresentEnum.ADD_BIBLE_ITEM, listener);
        return () => {
            fullTextPresentEventListener.unregisterEventListener(event);
        };
    });
}
export function useBiblePresenting(listener: ListenerType<FullTextPresentType>) {
    useEffect(() => {
        const event = fullTextPresentEventListener.registerEventListener(
            FullTextPresentEnum.PRESENT_BIBLE, listener);
        return () => {
            fullTextPresentEventListener.unregisterEventListener(event);
        };
    });
}

export function useLyricPresenting(listener: ListenerType<LyricPresentType[]>) {
    useEffect(() => {
        const event = fullTextPresentEventListener.registerEventListener(
            FullTextPresentEnum.PRESENT_LYRIC, listener);
        return () => {
            fullTextPresentEventListener.unregisterEventListener(event);
        };
    });
}

export function useLyricUpdating(listener: ListenerType<LyricPresentType[]>) {
    useEffect(() => {
        const event = fullTextPresentEventListener.registerEventListener(
            FullTextPresentEnum.UPDATE_LYRIC, listener);
        return () => {
            fullTextPresentEventListener.unregisterEventListener(event);
        };
    });
}

export function useFullTextPresenting(listener: ListenerType<void>) {
    useEffect(() => {
        const eventLyric = fullTextPresentEventListener.registerEventListener(
            FullTextPresentEnum.PRESENT_LYRIC, listener);
        const eventBible = fullTextPresentEventListener.registerEventListener(
            FullTextPresentEnum.PRESENT_BIBLE, listener);
        return () => {
            fullTextPresentEventListener.unregisterEventListener(eventLyric);
            fullTextPresentEventListener.unregisterEventListener(eventBible);
        };
    });
}

