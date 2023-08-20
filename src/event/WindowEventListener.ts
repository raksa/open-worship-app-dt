import { useAppEffect } from '../helper/debuggerHelpers';
import EventHandler, { ListenerType } from './EventHandler';
import KeyboardEventListener from './KeyboardEventListener';

export type AppWidgetType = 'root' | 'bible-search' | 'slide-item-edit' |
    'setting' | 'context-menu';
export type OpenCloseType = 'open' | 'close';
export type EventMapper = {
    widget: AppWidgetType,
    state: OpenCloseType,
};

export default class WindowEventListener extends EventHandler<string> {
    static eventNamePrefix: string = 'window';
    static fireEvent(event: EventMapper, data?: any) {
        if (event.state === 'open') {
            KeyboardEventListener.addLayer(event.widget);
        } else {
            KeyboardEventListener.removeLayer(event.widget);
        }
        const k = this.toEventMapperKey(event);
        this.addPropEvent(k, data);
    }
    static toEventMapperKey(event: EventMapper) {
        return `${event.widget}-${event.state}`;
    }
}

export function useWindowEvent(eventMapper: EventMapper,
    listener: ListenerType<any>) {
    useAppEffect(() => {
        const eventName = WindowEventListener.toEventMapperKey(eventMapper);
        const event = WindowEventListener.registerEventListener(
            [eventName], listener);
        return () => {
            WindowEventListener.unregisterEventListener(event);
        };
    }, [eventMapper]);
}
