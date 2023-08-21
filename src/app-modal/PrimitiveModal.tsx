import './Modal.scss';

import { ReactNode } from 'react';

interface MyProps {
    children?: ReactNode
}

export default function PrimitiveModal({
    children,
}: React.PropsWithChildren<MyProps>) {
    return (
        <div id='modal-container'>
            {children}
        </div>
    );
}