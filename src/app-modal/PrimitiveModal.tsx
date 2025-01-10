import './Modal.scss';

import { PropsWithChildren, ReactNode } from 'react';

interface MyProps {
    children?: ReactNode;
}

export default function PrimitiveModal({
    children,
}: PropsWithChildren<MyProps>) {
    return <div id="modal-container">{children}</div>;
}
