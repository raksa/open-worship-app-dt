import './ConfirmPopup.scss';

import PrimitiveModal from '../app-modal/PrimitiveModal';
import HeaderAlertPopup from './HeaderAlertPopup';
import {
    closeAlert, ConfirmDataType,
} from './alertHelpers';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';

export default function ConfirmPopup({ data }: Readonly<{
    data: ConfirmDataType,
}>) {
    const handleClosing = () => {
        data.onConfirm(false);
        closeAlert();
    };
    const handleOkClicking = () => {
        data.onConfirm(true);
        closeAlert();
    };
    useKeyboardRegistering([{ key: 'Escape' }], (event) => {
        event.preventDefault();
        handleClosing();
    });
    useKeyboardRegistering([{ key: 'Enter' }], () => {
        handleOkClicking();
    });
    return (
        <PrimitiveModal>
            <div id='confirm-popup'
                className='shadow card'>
                <HeaderAlertPopup header={(
                    <>
                        <i className='bi bi-exclamation-circle' />
                        {data.title}
                    </>
                )}
                    onClose={handleClosing}
                />
                <div className='card-body d-flex flex-column'>
                    <div className='p-2 flex-fill app-selectable-text'
                        dangerouslySetInnerHTML={{
                            __html: data.question,
                        }}
                    />
                    <div className='btn-group float-end'>
                        <button type='button'
                            className='btn btn-sm'
                            onClick={handleClosing}>
                            Cancel
                        </button>
                        <button type='button'
                            className='btn btn-sm btn-info'
                            onClick={handleOkClicking}>
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </PrimitiveModal>
    );
}
