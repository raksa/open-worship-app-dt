import { lazy, useState } from 'react';

import {
    AlertDataType, alertManager, ConfirmDataType,
} from './alertHelpers';
import AppSuspense from '../others/AppSuspense';

const LazyAlertPopup = lazy(() => {
    return import('./AlertPopup');
});

const LazyConfirmPopup = lazy(() => {
    return import('./ConfirmPopup');
});

export type AlertType = 'confirm' | null;

export default function HandleAlert() {
    const [confirmData, setConfirmData] = (
        useState<ConfirmDataType | null>(null)
    );
    const [alertData, setAlertData] = useState<AlertDataType | null>(null);

    alertManager.openConfirm = (newConfirmData) => {
        setConfirmData(newConfirmData);
    };
    alertManager.openAlert = (newAlertData) => {
        setAlertData(newAlertData);
    };
    return (
        <>
            {confirmData !== null && (
                <AppSuspense>
                    <LazyConfirmPopup data={confirmData} />
                </AppSuspense>
            )}
            {alertData !== null && (
                <AppSuspense>
                    <LazyAlertPopup data={alertData} />
                </AppSuspense>
            )}
        </>
    );
}
