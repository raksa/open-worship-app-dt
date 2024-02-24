import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import App from './App';
import { initApp } from './server/appHelper';
import appProvider from './server/appProvider';
import { initToolTip } from './tool-tip/init';
import { openConfirm } from './alert/alertHelpers';
import { handleError } from './helper/errorHelpers';

initApp().then(() => {
    initToolTip();
    const container = document.getElementById('root');
    if (container !== null) {
        const root = createRoot(container);
        root.render(
            <StrictMode>
                <App />
            </StrictMode>
        );
    }
});

const confirmEraseLocalStorage = () => {
    openConfirm('Reload is needed',
        'We were sorry, Internal process error, you to refresh the app'
    ).then((isOk) => {
        if (isOk) {
            appProvider.reload();
        }
    });
};

function isDomException(error: any) {
    return typeof error === 'object'
        && typeof error.message === 'string'
        && error.message.includes('DOMException');
}

window.onunhandledrejection = (promiseError) => {
    const reason = promiseError.reason;
    handleError(reason);
    if (isDomException(reason)) {
        return;
    }
    confirmEraseLocalStorage();
};

window.onerror = function (error: any) {
    handleError(error);
    if (isDomException(error)) {
        return;
    }
    confirmEraseLocalStorage();
};
