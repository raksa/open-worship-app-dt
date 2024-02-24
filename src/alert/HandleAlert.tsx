import { lazy, useState } from 'react';

import {
    AlertDataType, alertManager, ConfirmDataType,
} from './alertHelpers';
import AlertPopup from './AlertPopup';
import AppSuspense from '../others/AppSuspense';

const ConfirmPopup = lazy(() => {
    return import('./ConfirmPopup');
});

export type AlertType = 'confirm' | null;

export default function HandleAlert() {
    const [confirmData, setConfirmData] = useState<
        ConfirmDataType | null>(null);
    alertManager.openConfirm = (newConfirmData) => {
        setConfirmData(newConfirmData);
    };
    const [alertData, setAlertData] = useState<AlertDataType | null>(null);
    alertManager.openAlert = (newAlertData) => {
        setAlertData(newAlertData);
    };

    return (
        <>
            {confirmData !== null && <AppSuspense>
                <ConfirmPopup data={confirmData} />
            </AppSuspense>}
            {alertData !== null && <AppSuspense>
                <AlertPopup data={alertData} />
            </AppSuspense>}
        </>
    );
}
