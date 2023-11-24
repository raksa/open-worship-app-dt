import { lazy, useState } from 'react';
import AppSuspense from '../others/AppSuspense';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';

const Finder = lazy(() => {
    return import('./Finder');
});

export default function HandleFind() {
    const [isFinding, setIsFinding] = useState(false);
    useKeyboardRegistering([{
        wControlKey: ['Ctrl'],
        lControlKey: ['Ctrl'],
        mControlKey: ['Meta'],
        key: 'f',
    }], () => {
        setIsFinding(true);
    });
    if (!isFinding) {
        return null;
    }
    return (
        <AppSuspense>
            <Finder onClose={() => {
                setIsFinding(false);
            }} />
        </AppSuspense>
    );
}
