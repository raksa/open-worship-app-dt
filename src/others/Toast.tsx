import './Toast.scss';

import { useState } from 'react';
import { useToastSimpleShowing } from '../event/ToastEventListener';

export type SimpleToastType = {
    title: string,
    message: string,
    timeout?: number,
};

function SimpleToast({ onClose, toast }: {
    onClose: () => void,
    toast: SimpleToastType,
}) {
    return (
        <div className='toast show fade' role='alert' aria-live='assertive' aria-atomic='true'>
            <div className='toast-header'>
                <strong className='me-auto'>{toast.title}</strong>
                <button type='button' className='btn-close' data-bs-dismiss='toast' aria-label='Close'
                    onClick={onClose} />
            </div>
            <div className='toast-body'>
                {toast.message}
            </div>
        </div>
    );
}

export default function Toast() {
    const [simpleToast, setSimpleToast] = useState<SimpleToastType | null>(null);
    useToastSimpleShowing((toast: SimpleToastType) => {
        setSimpleToast(toast);
        setTimeout(() => setSimpleToast(null), toast.timeout || 4e3);
    });
    return (
        <>
            {simpleToast && <SimpleToast
                onClose={() => setSimpleToast(null)}
                toast={simpleToast} />}
        </>
    );
}
