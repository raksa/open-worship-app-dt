export type ListenerType<T> = (data: T) => (void | Promise<void>);

export type RegisteredEventType<T, F> = {
    eventName: T,
    listener: ListenerType<F>,
};

export default class EventHandler<T extends string> {
    static readonly eventNamePrefix: string = 'event';
    private static readonly _eventHandler = new EventHandler<any>();
    private _eventListenersMapper = new Map<string, ListenerType<any>[]>();
    _propEvent: {
        eventName: T,
        data?: any,
    }[] = [];
    _isLockProp: boolean = false;
    public destroy() {
        this._eventListenersMapper = new Map();
        this._propEvent = [];
    }

    _checkPropEvent() {
        if (this._isLockProp) {
            return;
        }
        while (this._propEvent.length) {
            const event = this._propEvent.shift();
            if (event !== undefined) {
                this._checkOnEvent(event.eventName, event.data);
            }
        }
    }

    addPropEvent(eventName: T, data?: any) {
        this._propEvent.push({
            eventName,
            data,
        });
        this._checkPropEvent();
    }
    static addPropEvent<T extends string>(eventName: T, data?: any) {
        this._eventHandler.addPropEvent(this.prefixEventName(eventName), data);
    }

    _guardEventName(eventName?: string) {
        if (!eventName) {
            throw new Error('invalid event name');
        }
    }

    _checkOnEvent(eventName: T, data?: any) {
        this._guardEventName(eventName);
        const listeners = this._eventListenersMapper.get(eventName) || [];
        listeners.forEach((listener: ListenerType<any>) => {
            listener(data);
        });
    }

    _addOnEventListener(eventName: T, listener: ListenerType<any>) {
        this._guardEventName(eventName);
        const listeners = this._eventListenersMapper.get(eventName) || [];
        listeners.push(listener);
        this._eventListenersMapper.set(eventName, listeners);
    }

    _removeOnEventListener(eventName: T, listener: ListenerType<any>) {
        this._guardEventName(eventName);
        const listeners = this._eventListenersMapper.get(eventName) || [];
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
    registerEventListener<F>(eventNames: T[], listener: ListenerType<F>):
        RegisteredEventType<T, F>[] {
        return eventNames.map((eventName) => {
            this._addOnEventListener(eventName, listener);
            return { eventName, listener };
        });
    }
    static registerEventListener<T extends string, F>(
        eventNames: T[], listener: ListenerType<F>):
        RegisteredEventType<T, F>[] {
        return eventNames.map((eventName) => {
            this._eventHandler._addOnEventListener(
                this.prefixEventName(eventName), listener);
            return { eventName, listener };
        });
    }
    unregisterEventListener<F>(regEvents: RegisteredEventType<T, F>[]) {
        regEvents.forEach(({ eventName, listener }) => {
            this._removeOnEventListener(eventName, listener);
        });
    }
    static unregisterEventListener<T extends string, F>(
        regEvents: RegisteredEventType<T, F>[]) {
        regEvents.forEach(({ eventName, listener }) => {
            this._eventHandler._removeOnEventListener(
                this.prefixEventName(eventName), listener);
        });
    }
    static prefixEventName(eventName: string) {
        return `${this.eventNamePrefix}-${eventName}`;
    }
}
