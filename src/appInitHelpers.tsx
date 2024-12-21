import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.css';
import './others/font.scss';
import './appInit.scss';
import './others/bootstrap-override.scss';
import './others/scrollbar.scss';

import { showAppConfirm } from './alert/alertHelpers';
import { useKeyboardRegistering } from './event/KeyboardEventListener';
import {
    getDownloadedBibleInfoList,
} from './helper/bible-helpers/bibleDownloadHelpers';
import { handleError } from './helper/errorHelpers';
import FileSourceMetaManager from './helper/FileSourceMetaManager';
import { getCurrentLangAsync, getLangAsync, defaultLocal } from './lang';
import appProvider from './server/appProvider';
import initCrypto from './_owa-crypto';
import { useHandleFind } from './_find/finderHelpers';
import { useCheckSelectedDir } from './helper/tourHelpers';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';

export async function initApp() {

    const confirmEraseLocalStorage = () => {
        showAppConfirm('Reload is needed',
            'We were sorry, Internal process error, you to refresh the app'
        ).then((isOk) => {
            if (isOk) {
                appProvider.reload();
            }
        });
    };

    function isDomException(error: any) {
        return error instanceof DOMException;
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

    await initCrypto();
    const downloadedBibleInfoList = await getDownloadedBibleInfoList();
    const promises = [
        FileSourceMetaManager.checkAllColorNotes(),
        getCurrentLangAsync(),
        getLangAsync(defaultLocal),
    ];
    for (const bibleInfo of downloadedBibleInfoList || []) {
        promises.push(getLangAsync(bibleInfo.locale));
    }
    await Promise.all(promises);
}

export function useQuickExitBlock() {
    useKeyboardRegistering([{
        key: 'q',
        mControlKey: ['Meta'],
    }], async (event) => {
        event.preventDefault();
        await showAppConfirm('Quick Exit',
            'Are you sure you want to quit the app?'
        ).then((isOk) => {
            if (isOk) {
                window.close();
            }
        });
    });
}

export function getRootElement<T>(): T {
    const container = document.getElementById('root');
    if (container === null) {
        const message = 'Root element not found';
        window.alert(message);
        throw new Error(message);
    }
    return container as T;
}

export function RenderApp({ children }: Readonly<{
    children: React.ReactNode,
}>) {
    useQuickExitBlock();
    useCheckSelectedDir();
    useHandleFind();
    return (
        <div id='app' className='dark' data-bs-theme='dark'>
            <StrictMode>
                {children}
            </StrictMode>
        </div>
    );
}

export async function main(children: React.ReactNode) {
    await initApp();
    const container = getRootElement<HTMLDivElement>();
    const root = createRoot(container);
    root.render(
        <RenderApp>
            {children}
        </RenderApp>
    );
}
