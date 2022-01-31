import './Modal.scss';

import { ReactNode } from 'react';

interface MyProps {
    children?: ReactNode
}

export default function Modal({ children }: React.PropsWithChildren<MyProps>) {
    return <div className="modal-container  w-100 h-100">
        {children}
    </div>;
}
