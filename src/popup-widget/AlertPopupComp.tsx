import './AlertPopupComp.scss';

import PrimitiveModal from '../app-modal/PrimitiveModal';
import HeaderAlertPopup from './HeaderAlertPopup';
import {
    AlertDataType, closeAlert,
} from './popupWidgetHelpers';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';

export default function AlertPopupComp({ data }: Readonly<{
    data: AlertDataType,
}>) {
    const handClose = () => {
        data.onClose();
        closeAlert();
    };
    useKeyboardRegistering([{ key: 'Escape' }], (event) => {
        event.preventDefault();
        handClose();
    });
    return (
        <PrimitiveModal>
            <div id='app-alert-popup' className='shadow card'>
                <HeaderAlertPopup
                    header={<>
                        <i className='bi bi-exclamation-circle' />
                        {data.title}
                    </>}
                    onClose={handClose}
                />
                <div className='card-body d-flex flex-column'>
                    <div className='p-2 flex-fill app-selectable-text'
                        dangerouslySetInnerHTML={{
                            __html: data.message,
                        }}
                    />
                </div>
            </div>
        </PrimitiveModal>
    );
}
