import { useEffect } from 'react';
import { SimpleToastType } from '../others/Toast';
import EventHandler from './EventHandler';

type ListenerType = (toast: SimpleToastType) => void;
export type ToastEventType = 'simple';
export type RegisteredEventType = {
    type: ToastEventType,
    listener: ListenerType,
};
export default class ToastEventListener extends EventHandler<ToastEventType> {
    showSimpleToast(toast: SimpleToastType) {
        this._addPropEvent('simple', toast);
    }
    registerToastEventListener(type: ToastEventType, listener: ListenerType): RegisteredEventType {
        this._addOnEventListener(type, listener);
        return {
            type,
            listener,
        };
    }
    unregisterToastEventListener({ type, listener }: RegisteredEventType) {
        this._removeOnEventListener(type, listener);
    }
}

export const toastEventListener = new ToastEventListener();

export function useToastSimpleShowing(listener: ListenerType) {
    useEffect(() => {
        const event = toastEventListener.registerToastEventListener('simple', listener);
        return () => {
            toastEventListener.unregisterToastEventListener(event);
        };
    });
}
