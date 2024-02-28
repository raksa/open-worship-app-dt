import './Modal.scss';

import { PropsWithChildren, ReactNode, createContext } from 'react';

import {
    EventMapper, toShortcutKey, useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { useCloseAppModal } from './LinkToAppModal';


interface MyProps {
    children?: ReactNode
}

const quittingEventMap: EventMapper = {
    allControlKey: ['Ctrl'],
    key: 'q',
};

export const CloseButtonContext = createContext<JSX.Element | null>(null);

export function useModal() {
    const closeModal = useCloseAppModal();
    useKeyboardRegistering([quittingEventMap], () => {
        closeModal();
    });
    const closeButton = (
        <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
        }}>
            <button type='button'
                onClick={() => {
                    closeModal();
                }}
                data-tool-tip={toShortcutKey(quittingEventMap)}
                className='btn btn-sm btn-danger'>
                <i className='bi bi-x-lg' />
            </button>
        </div>
    );
    function Modal({ children }: PropsWithChildren<MyProps>) {
        return (
            <CloseButtonContext.Provider value={closeButton}>
                <div id='modal-container'>
                    {children}
                </div >
            </CloseButtonContext.Provider>
        );
    }
    return {
        closeModal,
        Modal,
    };
}
