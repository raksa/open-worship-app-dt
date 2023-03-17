import React, { Suspense, useState } from 'react';
import {
    AlertDataType,
    alertManager,
    ConfirmDataType,
} from './alertHelpers';
import AlertPopup from './AlertPopup';

const ConfirmPopup = React.lazy(() => {
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
            {confirmData !== null && <Suspense
                fallback={<div>Loading ...</div>}>
                <ConfirmPopup data={confirmData} />
            </Suspense>}
            {alertData !== null && <Suspense
                fallback={<div>Loading ...</div>}>
                <AlertPopup data={alertData} />
            </Suspense>}
        </>
    );
}
