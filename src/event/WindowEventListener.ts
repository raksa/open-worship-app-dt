import { useEffect } from 'react';
import EventHandler from './EventHandler';
import { keyboardEventListener } from './KeyboardEventListener';

export enum WindowEnum {
    Root = 'root',
    BibleSearch = 'BibleSearch',
    ItemSlideEdit = 'ItemSlideEdit',
    Setting = 'Setting',
}
export enum StateEnum {
    Open = 'open',
    Close = 'close',
}
export type EventMapper = {
    window: WindowEnum,
    state: StateEnum,
};
type ListenerType = (data?: any) => void;
export type RegisteredEventType = {
    eventMapper: EventMapper,
    listener: ListenerType,
};
export default class WindowEventListener extends EventHandler {
    fireEvent(event: EventMapper, data?: any) {
        if (event.state === StateEnum.Open) {
            keyboardEventListener.addLayer(event.window);
        } else {
            keyboardEventListener.removeLayer(event.window);
        }
        const k = this.toEventMapperKey(event);
        this._addPropEvent(k, data);
    }
    toEventMapperKey(event: EventMapper) {
        return `${event.window}-${event.state}`;
    }
    registerWindowEventListener(eventMapper: EventMapper,
        listener: ListenerType): RegisteredEventType {
        const key = this.toEventMapperKey(eventMapper);
        this._addOnEventListener(key, listener);
        return { eventMapper, listener };
    }
    unregisterWindowEventListener({ eventMapper, listener }: RegisteredEventType) {
        const key = this.toEventMapperKey(eventMapper);
        this._removeOnEventListener(key, listener);
        return eventMapper;
    }
}

export const windowEventListener = new WindowEventListener();

export function useWindowEvent(eventMapper: EventMapper, listener: ListenerType) {
    useEffect(() => {
        const event = windowEventListener.registerWindowEventListener(eventMapper, listener);
        return () => {
            windowEventListener.unregisterWindowEventListener(event);
        };
    });
}
