import './ConfirmPopupComp.scss';

import PrimitiveModalComp from '../app-modal/PrimitiveModalComp';
import HeaderAlertPopupComp from './HeaderAlertPopupComp';
import { closeAlert, ConfirmDataType } from './popupWidgetHelpers';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';

export default function ConfirmPopupComp({
    data,
}: Readonly<{
    data: ConfirmDataType;
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
        <PrimitiveModalComp>
            <div id="app-confirm-popup" className="shadow card">
                <HeaderAlertPopupComp
                    header={
                        <div className="app-ellipsis" title={data.title}>
                            <i className="bi bi-exclamation-circle" />
                            {data.title}
                        </div>
                    }
                    onClose={handleClosing}
                />
                <div className="card-body d-flex flex-column">
                    <div
                        className="p-2 flex-fill app-selectable-text"
                        dangerouslySetInnerHTML={{
                            __html: data.question,
                        }}
                    />
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
        </PrimitiveModalComp>
    );
}
