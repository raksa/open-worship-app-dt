export function closeAlert() {
    alertManager.openConfirm?.(null);
    alertManager.openAlert?.(null);
}

export type ConfirmDataType = {
    title: string;
    question: string;
    onConfirm: (isOk: boolean) => void;
};

export type AlertDataType = {
    title: string;
    question: string;
    onClose: () => void;
};

export const alertManager: {
    openConfirm: ((_: ConfirmDataType | null) => void) | null;
    openAlert: ((_: AlertDataType | null) => void) | null;
} = {
    openConfirm: null,
    openAlert: null,
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

export function openAlert(title: string, question: string) {
    if (alertManager.openAlert === null) {
        return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
        if (alertManager.openAlert !== null) {
            alertManager.openAlert({
                title,
                question,
                onClose: () => {
                    resolve();
                },
            });
        }
    });
}
