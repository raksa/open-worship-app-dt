export type ListenerType<T> = (data: T) => void;

export default class EventHandler {
    _onEventListeners: { [key: string]: ListenerType<any>[] };
    _propEvent: any[];
    events: { [key: string]: string };
    _isLockProp: boolean = false;
    constructor(options?: { events?: { [key: string]: string } }) {
        this._onEventListeners = {};
        this._propEvent = [];
        this.events = {};
        if (options?.events) {
            this.events = options.events;
        } else {
            this.events = {};
        }
    }

    public destroy() {
        this._onEventListeners = {};
        this._propEvent = [];
    }

    _checkPropEvent() {
        if (this._isLockProp) {
            return;
        }
        while (this._propEvent.length) {
            const event = this._propEvent.shift();
            this._checkOnEvent(event.name, event.data);
        }
    }

    _addPropEvent(event: string, data?: any) {
        this._propEvent.push({
            name: event,
            data,
        });
        this._checkPropEvent();
    }

    _guardEventName(eventName?: string) {
        if (!eventName) {
            throw new Error('invalid event name');
        }
    }

    _checkOnEvent(eventName: string, data?: any) {
        this._guardEventName(eventName);
        this._onEventListeners[eventName] = this._onEventListeners[eventName] || [];
        this._onEventListeners[eventName].forEach((listener: ListenerType<any>) => {
            listener(data);
        });
    }

    _addOnEventListener(eventName: string, listener: ListenerType<any>) {
        this._guardEventName(eventName);
        this._onEventListeners[eventName] = this._onEventListeners[eventName] || [];
        this._onEventListeners[eventName].push(listener);
    }

    _removeOnEventListener(eventName: string, listener: ListenerType<any>) {
        this._guardEventName(eventName);
        this._onEventListeners[eventName] = this._onEventListeners[eventName] || [];
        const index = this._onEventListeners[eventName].indexOf(listener);
        ~index && this._onEventListeners[eventName].splice(index, 1);
    }
}

export const globalEventHandler = new EventHandler();
