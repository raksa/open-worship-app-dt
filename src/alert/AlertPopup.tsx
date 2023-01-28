import './AlertPopup.scss';

import Modal from '../others/Modal';
import HeaderAlertPopup from './HeaderAlertPopup';
import {
    AlertDataType,
    closeAlert,
} from './alertHelpers';
import { useCallback } from 'react';

export default function AlertPopup({ data }: {
    data: AlertDataType,
}) {
    const onCloseCallback = useCallback(() => {
        data.onClose();
        closeAlert();
    }, [closeAlert, data]);
    return (
        <Modal>
            <div id='alert-popup'
                className='app-modal shadow card'>
                <HeaderAlertPopup
                    header={<>
                        <i className='bi bi-exclamation-circle' />
                        {data.title}
                    </>}
                    onClose={onCloseCallback} />
                <div className='card-body d-flex flex-column'>
                    <div className='p-2 flex-fill flex h selectable-text'
                        dangerouslySetInnerHTML={{
                            __html: data.question,
                        }} />
                </div>
            </div>
        </Modal>
    );
}
