export type ListenerType<T> = (data: T) => (void | Promise<void>);

export type RegisteredEventType<T, F> = {
    type: T,
    listener: ListenerType<F>,
};

export default class EventHandler<T extends string> {
    static readonly eventHandler = new EventHandler<any>();
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

    addPropEvent(event: T, data?: any) {
        this._propEvent.push({
            name: event,
            data,
        });
        this._checkPropEvent();
    }
    static addPropEvent<T>(event: T, data?: any) {
        this.eventHandler.addPropEvent(event, data);
    }

    _guardEventName(eventName?: string) {
        if (!eventName) {
            throw new Error('invalid event name');
        }
    }

    _checkOnEvent(eventName: T, data?: any) {
        this._guardEventName(eventName);
        this._onEventListeners[eventName] = this._onEventListeners[eventName] || [];
        this._onEventListeners[eventName].forEach((listener: ListenerType<any>) => {
            listener(data);
        });
    }

    _addOnEventListener(eventName: T, listener: ListenerType<any>) {
        this._guardEventName(eventName);
        this._onEventListeners[eventName] = this._onEventListeners[eventName] || [];
        this._onEventListeners[eventName].push(listener);
    }

    _removeOnEventListener(eventName: T, listener: ListenerType<any>) {
        this._guardEventName(eventName);
        this._onEventListeners[eventName] = this._onEventListeners[eventName] || [];
        const index = this._onEventListeners[eventName].indexOf(listener);
        ~index && this._onEventListeners[eventName].splice(index, 1);
    }
    registerEventListener<F>(types: T[], listener: ListenerType<F>):
        RegisteredEventType<T, F>[] {
        return types.map((type) => {
            this._addOnEventListener(type, listener);
            return { type, listener };
        });
    }
    static registerEventListener<T, F>(types: T[], listener: ListenerType<F>):
        RegisteredEventType<T, F>[] {
        return types.map((type) => {
            this.eventHandler._addOnEventListener(type, listener);
            return { type, listener };
        });
    }
    static unregisterEventListener<T, F>(regEvents: RegisteredEventType<T, F>[]) {
        regEvents.forEach(({ type, listener }) => {
            this.eventHandler._removeOnEventListener(type, listener);
        });
    }
    unregisterEventListener<F>(regEvents: RegisteredEventType<T, F>[]) {
        regEvents.forEach(({ type, listener }) => {
            this._removeOnEventListener(type, listener);
        });
    }
}

export const globalEventHandler = new EventHandler();
