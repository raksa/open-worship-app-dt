import './ConfirmPopup.scss';

import Modal from '../others/Modal';
import {
    closeAlert,
    ConfirmDataType,
} from './HandleAlert';
import HeaderAlertPopup from './HeaderAlertPopup';

export default function ConfirmPopup({ data }: {
    data: ConfirmDataType,
}) {
    const cancel = () => {
        data.onConfirm(false);
        closeAlert();
    };
    return (
        <Modal>
            <div id='confirm-popup'
                className='app-modal shadow card'>
                <HeaderAlertPopup header={<>
                    <i className='bi bi-exclamation-circle' /> {data.title}
                </>} onClose={cancel} />
                <div className='card-body d-flex flex-column'>
                    <div className='p-2 flex-fill flex h'>
                        {data.question}
                    </div>
                    <div className='btn-group float-end'>
                        <button type='button'
                            className='btn btn-sm'
                            onClick={cancel}>Cancel</button>
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