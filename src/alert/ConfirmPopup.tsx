import './ConfirmPopup.scss';

import Modal from '../others/Modal';
import HeaderAlertPopup from './HeaderAlertPopup';
import {
    closeAlert,
    ConfirmDataType,
} from './alertHelpers';
import { useCallback } from 'react';

export default function ConfirmPopup({ data }: {
    data: ConfirmDataType,
}) {
    const onCloseCallback = useCallback(() => {
        data.onConfirm(false);
        closeAlert();
    }, [data]);
    return (
        <Modal>
            <div id='confirm-popup'
                className='app-modal shadow card'>
                <HeaderAlertPopup header={<>
                    <i className='bi bi-exclamation-circle' />
                    {data.title}
                </>} onClose={onCloseCallback} />
                <div className='card-body d-flex flex-column'>
                    <div className='p-2 flex-fill flex h selectable-text'
                        dangerouslySetInnerHTML={{
                            __html: data.question,
                        }} />
                    <div className='btn-group float-end'>
                        <button type='button'
                            className='btn btn-sm'
                            onClick={onCloseCallback}>Cancel</button>
                        <button type='button'
                            className='btn btn-sm btn-info'
                            onClick={() => {
                                data.onConfirm(true);
                                closeAlert();
                            }}>Ok</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
