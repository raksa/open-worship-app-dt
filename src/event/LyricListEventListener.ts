import { useEffect } from 'react';
import { LyricPresentType } from '../lyric-list/LyricList';
import EventHandler from './EventHandler';

enum LyricListEnum {
    PRESENT = 'present',
    UPDATE = 'update',
}
type ListenerType<T> = (data: T) => void | (() => void);
export type RegisteredEventType<T> = {
    type: LyricListEnum,
    listener: ListenerType<T>,
};

export default class LyricListEventListener extends EventHandler {
    present(lyricPresents: LyricPresentType[]) {
        this._addPropEvent(LyricListEnum.PRESENT, lyricPresents);
    }
    update(lyricPresents: LyricPresentType[]) {
        this._addPropEvent(LyricListEnum.UPDATE, lyricPresents);
    }
    registerLyricListEventListener(type: LyricListEnum, listener: ListenerType<any>):
        RegisteredEventType<any> {
        this._addOnEventListener(type, listener);
        return {
            type,
            listener,
        };
    }
    unregisterLyricListEventListener({ type, listener }: RegisteredEventType<any>) {
        this._removeOnEventListener(type, listener);
    }
}

export const lyricListEventListener = new LyricListEventListener();

export function useLyricPresenting(listener: ListenerType<LyricPresentType[]>) {
    useEffect(() => {
        const event = lyricListEventListener.registerLyricListEventListener(
            LyricListEnum.PRESENT, listener);
        return () => {
            lyricListEventListener.unregisterLyricListEventListener(event);
        };
    });
}

export function useLyricUpdating(listener: ListenerType<LyricPresentType[]>) {
    useEffect(() => {
        const event = lyricListEventListener.registerLyricListEventListener(
            LyricListEnum.UPDATE, listener);
        return () => {
            lyricListEventListener.unregisterLyricListEventListener(event);
        };
    });
}
