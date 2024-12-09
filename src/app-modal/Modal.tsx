import './Modal.scss';

import { PropsWithChildren, ReactNode } from 'react';

import {
    EventMapper, toShortcutKey,
} from '../event/KeyboardEventListener';


interface MyProps {
    children?: ReactNode
}

const quittingEventMap: EventMapper = {
    allControlKey: ['Ctrl'],
    key: 'q',
};

export function ModalCloseButton({ close }: Readonly<{ close: () => void }>) {
    return (
        <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
        }}>
            <button type='button'
                onClick={close}
                data-tool-tip={toShortcutKey(quittingEventMap)}
                className='btn btn-sm btn-danger'>
                <i className='bi bi-x-lg' />
            </button>
        </div>
    );
}

export function Modal({ children }: PropsWithChildren<MyProps>) {
    return (
        <div id='modal-container'>
            {children}
        </div >
    );
}
