import './Toast.scss';

import { useState } from 'react';

import { useToastSimpleShowing } from '../event/ToastEventListener';
import SimpleToast, { SimpleToastType } from './SimpleToast';

let timeoutId: any = null;
export default function Toast() {
    const handleMouseEntering = () => {
        clearTimer();
    };
    const handleMouseLeaving = () => {
        initTimeout(2e3);
    };
    const handleClosing = () => {
        setSimpleToast(null);
    };
    const [simpleToast, setSimpleToast] = useState<SimpleToastType | null>(
        null,
    );
    const clearTimer = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };
    const initTimeout = (timer: number) => {
        clearTimer();
        timeoutId = setTimeout(() => {
            timeoutId = null;
            setSimpleToast(null);
        }, timer);
    };
    useToastSimpleShowing((toast: SimpleToastType) => {
        setSimpleToast(toast);
        initTimeout(toast.timeout ?? 4e3);
    });
    if (!simpleToast) {
        return null;
    }
    return (
        <SimpleToast
            onMouseEnter={handleMouseEntering}
            onMouseLeave={handleMouseLeaving}
            onClose={handleClosing}
            toast={simpleToast}
        />
    );
}
