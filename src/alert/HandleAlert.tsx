import { lazy, useState } from 'react';

import {
    AlertDataType, alertManager, ConfirmDataType,
} from './alertHelpers';
import AppSuspenseComp from '../others/AppSuspenseComp';

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
                <AppSuspenseComp>
                    <LazyConfirmPopup data={confirmData} />
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
