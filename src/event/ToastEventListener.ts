import { useAppEffect } from '../helper/debuggerHelpers';
import { SimpleToastType } from '../toast/SimpleToast';
import EventHandler, { ListenerType } from './EventHandler';

export type ToastEventType = 'simple';

export default class ToastEventListener extends EventHandler<ToastEventType> {
    static readonly eventNamePrefix: string = 'toast';
    static showSimpleToast(toast: SimpleToastType) {
        this.addPropEvent('simple', toast);
    }
}

export function useToastSimpleShowing(listener: ListenerType<SimpleToastType>) {
    useAppEffect(() => {
        const event = ToastEventListener.registerEventListener(
            ['simple'], listener,
        );
        return () => {
            ToastEventListener.unregisterEventListener(event);
        };
    });
}
