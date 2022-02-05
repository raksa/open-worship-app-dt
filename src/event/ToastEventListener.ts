import { useEffect } from 'react';
import { SimpleToastType } from '../others/Toast';
import EventHandler from './EventHandler';

type ListenerType = (toast: SimpleToastType) => void;
export enum ToastTypeEnum {
    Simple = 'simple',
}
export type RegisteredEventType = {
    type: ToastTypeEnum,
    listener: ListenerType,
};
export default class ToastEventListener extends EventHandler {
    showSimpleToast(toast: SimpleToastType) {
        this._addPropEvent(ToastTypeEnum.Simple, toast);
    }
    registerToastEventListener(type: ToastTypeEnum, listener: ListenerType): RegisteredEventType {
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
        const event = toastEventListener.registerToastEventListener(
            ToastTypeEnum.Simple, listener);
            return () => {
            toastEventListener.unregisterToastEventListener(event);
        };
    });
}
