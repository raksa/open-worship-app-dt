import React, { Suspense, useState } from 'react';

const ConfirmPopup = React.lazy(() => import('./ConfirmPopup'));

export function closeAlert() {
    if (alertManager.openConfirm !== null) {
        alertManager.openConfirm(null);
    }
}
export type ConfirmDataType = {
    title: string;
    question: string;
    onConfirm: (isOk: boolean) => void;
};
export function openConfirm(title: string, question: string) {
    if (alertManager.openConfirm === null) {
        return Promise.resolve(false);
    }
    return new Promise<boolean>((resolve) => {
        if (alertManager.openConfirm !== null) {
            alertManager.openConfirm({
                title,
                question,
                onConfirm: (isOk) => {
                    resolve(isOk);
                },
            });
        }
    });
}
const alertManager: {
    openConfirm: ((_: ConfirmDataType | null) => void) | null;
} = {
    openConfirm: null,
};

export type AlertType = 'confirm' | null;

export default function HandleAlert() {
    const [confirmData, setConfirmData] = useState<ConfirmDataType | null>(null);
    alertManager.openConfirm = (newConfirmData) => {
        setConfirmData(newConfirmData);
    };

    return (
        <>
            {confirmData !== null && <Suspense
                fallback={<div>Loading ...</div>}>
                <ConfirmPopup data={confirmData} />
            </Suspense>}
        </>
    );
}
