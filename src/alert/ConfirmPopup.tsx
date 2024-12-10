import './ConfirmPopup.scss';

import PrimitiveModal from '../app-modal/PrimitiveModal';
import HeaderAlertPopup from './HeaderAlertPopup';
import {
    closeAlert, ConfirmDataType,
} from './alertHelpers';

export default function ConfirmPopup({ data }: Readonly<{
    data: ConfirmDataType,
}>) {
    const handClose = () => {
        data.onConfirm(false);
        closeAlert();
    };
    return (
        <PrimitiveModal>
            <div id='confirm-popup'
                className='shadow card'>
                <HeaderAlertPopup header={<>
                    <i className='bi bi-exclamation-circle' />
                    {data.title}
                </>} onClose={handClose} />
                <div className='card-body d-flex flex-column'>
                    <div className='p-2 flex-fill app-selectable-text'
                        dangerouslySetInnerHTML={{
                            __html: data.question,
                        }} />
                    <div className='btn-group float-end'>
                        <button type='button'
                            className='btn btn-sm'
                            onClick={handClose}>Cancel</button>
                        <button type='button'
                            className='btn btn-sm btn-info'
                            onClick={() => {
                                data.onConfirm(true);
                                closeAlert();
                            }}>Ok</button>
                    </div>
                </div>
            </div>
        </PrimitiveModal>
    );
}
