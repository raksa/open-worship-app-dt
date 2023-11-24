import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import appProvider from '../server/appProvider';

export function useHandleFind() {
    useKeyboardRegistering([{
        wControlKey: ['Ctrl'],
        lControlKey: ['Ctrl'],
        mControlKey: ['Meta'],
        key: 'f',
    }], () => {
        appProvider.messageUtils.sendData('main:app:open-search');
    });
}
