import './AlertPopup.scss';

import PrimitiveModal from '../app-modal/PrimitiveModal';
import HeaderAlertPopup from './HeaderAlertPopup';
import {
    AlertDataType, closeAlert,
} from './alertHelpers';

export default function AlertPopup({ data }: Readonly<{
    data: AlertDataType,
}>) {
    const handClose = () => {
        data.onClose();
        closeAlert();
    };
    return (
        <PrimitiveModal>
            <div id='alert-popup'
                className='shadow card'>
                <HeaderAlertPopup
                    header={<>
                        <i className='bi bi-exclamation-circle' />
                        {data.title}
                    </>}
                    onClose={handClose} />
                <div className='card-body d-flex flex-column'>
                    <div className='p-2 flex-fill app-selectable-text'
                        dangerouslySetInnerHTML={{
                            __html: data.question,
                        }} />
                </div>
            </div>
        </PrimitiveModal>
    );
}
