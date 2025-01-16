import { lazy, useState } from 'react';

import {
    AlertDataType,
    popupWidgetManager,
    ConfirmDataType,
    InputDataType,
} from './popupWidgetHelpers';
import AppSuspenseComp from '../others/AppSuspenseComp';

const LazyConfirmPopup = lazy(() => {
    return import('./ConfirmPopupComp');
});
const LazyInputPopup = lazy(() => {
    return import('./InputPopupComp');
});
const LazyAlertPopup = lazy(() => {
    return import('./AlertPopupComp');
});

export type AlertType = 'confirm' | null;

export default function HandleAlertComp() {
    const [confirmData, setConfirmData] = useState<ConfirmDataType | null>(
        null,
    );
    const [inputData, setInputData] = useState<InputDataType | null>(null);
    const [alertData, setAlertData] = useState<AlertDataType | null>(null);

    popupWidgetManager.openConfirm = (newConfirmData) => {
        setConfirmData(newConfirmData);
    };
    popupWidgetManager.openInput = (newInputData) => {
        setInputData(newInputData);
    };
    popupWidgetManager.openAlert = (newAlertData) => {
        setAlertData(newAlertData);
    };
    return (
        <>
            {confirmData !== null && (
                <AppSuspenseComp>
                    <LazyConfirmPopup data={confirmData} />
                </AppSuspenseComp>
            )}
            {inputData !== null && (
                <AppSuspenseComp>
                    <LazyInputPopup data={inputData} />
                </AppSuspenseComp>
            )}
            {alertData !== null && (
                <AppSuspenseComp>
                    <LazyAlertPopup data={alertData} />
                </AppSuspenseComp>
            )}
        </>
    );
}
