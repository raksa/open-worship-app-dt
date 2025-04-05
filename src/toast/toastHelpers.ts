import ToastEventListener from '../event/ToastEventListener';

export function showSimpleToast(title: string, message: string) {
    ToastEventListener.showSimpleToast({ title, message });
}
