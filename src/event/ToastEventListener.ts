import { useEffect } from 'react';
import { SimpleToastType } from '../others/Toast';
import EventHandler, { ListenerType } from './EventHandler';

export type ToastEventType = 'simple';

export default class ToastEventListener extends EventHandler<ToastEventType> {
    showSimpleToast(toast: SimpleToastType) {
        this.addPropEvent('simple', toast);
    }
}

export const toastEventListener = new ToastEventListener();

export function useToastSimpleShowing(listener: ListenerType<SimpleToastType>) {
    useEffect(() => {
        const event = toastEventListener.registerEventListener(['simple'], listener);
        return () => {
            toastEventListener.unregisterEventListener(event);
        };
    });
}
