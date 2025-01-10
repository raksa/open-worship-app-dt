import './InputPopupComp.scss';

import PrimitiveModal from '../app-modal/PrimitiveModal';
import HeaderAlertPopup from './HeaderAlertPopup';
import { closeAlert, InputDataType } from './popupWidgetHelpers';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';

export default function ConfirmPopupComp({
    data,
}: Readonly<{
    data: InputDataType;
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
            <div id="app-input-popup" className="shadow card">
                <HeaderAlertPopup
                    header={
                        <div className="app-ellipsis" title={data.title}>
                            <i className="bi bi-exclamation-circle" />
                            {data.title}
                        </div>
                    }
                    onClose={handleClosing}
                />
                <div className="card-body d-flex flex-column w-100 h-100">
                    <div
                        className="w-100"
                        style={{
                            maxHeight: '500px',
                            overflow: 'auto',
                        }}
                    >
                        {data.body}
                    </div>
                    <div className="btn-group float-end">
                        <button
                            type="button"
                            className="btn btn-sm"
                            onClick={handleClosing}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-info"
                            onClick={handleOkClicking}
                        >
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </PrimitiveModal>
    );
}
