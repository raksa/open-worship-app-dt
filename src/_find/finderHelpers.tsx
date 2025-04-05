import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import appProvider from '../server/appProvider';

export function useHandleFind() {
    useKeyboardRegistering(
        [
            {
                wControlKey: ['Ctrl'],
                lControlKey: ['Ctrl'],
                mControlKey: ['Meta'],
                key: 'f',
            },
        ],
        () => {
            appProvider.messageUtils.sendData('main:app:open-finder');
        },
        [],
    );
}

export type LookupOptions = {
    forward?: boolean;
    findNext?: boolean;
    matchCase?: boolean;
};

export function findString(text: string, options: LookupOptions = {}) {
    if (!text) {
        appProvider.messageUtils.sendData(
            'finder:app:stop-search-in-page',
            'clearSelection',
        );
        return;
    }
    appProvider.messageUtils.sendDataSync(
        'finder:app:search-in-page',
        text,
        options,
    );
}
