import { useEffect } from 'react';
import EventHandler from './EventHandler';
import { keyboardEventListener } from './KeyboardEventListener';

export type AppWidgetType = 'root' | 'bible-search' | 'slide-item-edit' | 'setting';
export type OpenCloseType = 'open' | 'close';
export type EventMapper = {
    widget: AppWidgetType,
    state: OpenCloseType,
};
type ListenerType = (data?: any) => void;
export type RegisteredEventType = {
    eventMapper: EventMapper,
    listener: ListenerType,
};
export default class WindowEventListener extends EventHandler<string> {
    fireEvent(event: EventMapper, data?: any) {
        if (event.state === 'open') {
            keyboardEventListener.addLayer(event.widget);
        } else {
            keyboardEventListener.removeLayer(event.widget);
        }
        const k = this.toEventMapperKey(event);
        this.addPropEvent(k, data);
    }
    toEventMapperKey(event: EventMapper) {
        return `${event.widget}-${event.state}`;
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
