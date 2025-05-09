import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.css';
import './appInit.scss';
import './others/bootstrap-override.scss';
import './others/scrollbar.scss';

import { showAppConfirm } from './popup-widget/popupWidgetHelpers';
import {
    PlatformEnum,
    useKeyboardRegistering,
} from './event/KeyboardEventListener';
import { getAllLocalBibleInfoList } from './helper/bible-helpers/bibleDownloadHelpers';
import { handleError } from './helper/errorHelpers';
import FileSourceMetaManager from './helper/FileSourceMetaManager';
import {
    getCurrentLangAsync,
    getLangAsync,
    defaultLocale,
    getCurrentLocale,
} from './lang';
import appProvider from './server/appProvider';
import initCrypto from './_owa-crypto';
import { useHandleFind } from './_find/finderHelpers';
import { useCheckSelectedDir } from './helper/tourHelpers';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { getSetting, setSetting } from './helper/settingHelpers';
import { unlocking } from './server/appHelpers';
import { applyFontFamily, MutationType } from './others/LanguageWrapper';

const ERROR_DATETIME_SETTING_NAME = 'error-datetime-setting';
const ERROR_DURATION = 1000 * 10; // 10 seconds;

async function confirmLocalStorageErasing() {
    const isOk = await showAppConfirm(
        'Unfixable Error',
        'We were sorry, local settings are broken, we need to erase local' +
            ' storage and reload the app',
    );
    if (isOk) {
        localStorage.clear();
    }
    appProvider.reload();
}

async function confirmReloading() {
    await unlocking(ERROR_DATETIME_SETTING_NAME, async () => {
        const oldDatetimeString = getSetting(ERROR_DATETIME_SETTING_NAME);
        if (oldDatetimeString) {
            const oldDatetime = parseInt(oldDatetimeString);
            if (Date.now() - oldDatetime < ERROR_DURATION) {
                confirmLocalStorageErasing();
                return;
            }
        }
        setSetting(ERROR_DATETIME_SETTING_NAME, Date.now().toString());
        const isOk = await showAppConfirm(
            'Reload is needed',
            'We were sorry, Internal process error, you to refresh the app',
        );
        if (isOk) {
            appProvider.reload();
        }
    });
}

export async function initApp() {
    function isDomException(error: any) {
        return error instanceof DOMException;
    }

    window.onunhandledrejection = (promiseError) => {
        const reason = promiseError.reason;
        handleError(reason);
        if (isDomException(reason)) {
            return;
        }
        confirmReloading();
    };

    window.onerror = function (error: any) {
        handleError(error);
        if (isDomException(error)) {
            return;
        }
        confirmReloading();
    };

    await initCrypto();
    const localBibleInfoList = await getAllLocalBibleInfoList();
    const promises = [
        FileSourceMetaManager.checkAllColorNotes(),
        getCurrentLangAsync(),
        getLangAsync(defaultLocale),
    ];
    for (const bibleInfo of localBibleInfoList) {
        promises.push(getLangAsync(bibleInfo.locale));
    }
    await Promise.all(promises);
}

export function useQuickExitBlock() {
    useKeyboardRegistering(
        [
            {
                key: 'q',
                mControlKey: ['Meta'],
                platforms: [PlatformEnum.Mac],
            },
        ],
        async (event) => {
            event.preventDefault();
            await showAppConfirm(
                'Quick Exit',
                'Are you sure you want to quit the app?',
            ).then((isOk) => {
                if (isOk) {
                    window.close();
                }
            });
        },
        [],
    );
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

export function RenderApp({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    useQuickExitBlock();
    useCheckSelectedDir();
    useHandleFind();
    return (
        <div id="app" className="dark" data-bs-theme="dark">
            <StrictMode>{children}</StrictMode>
        </div>
    );
}

function onDomChange(callback: (element: Node, type: MutationType) => void) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    callback(node, 'added');
                });
            } else if (mutation.type === 'attributes') {
                callback(mutation.target, 'attr-modified');
            }
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
    });
    return () => {
        observer.disconnect();
    };
}

export async function main(children: React.ReactNode) {
    await initApp();
    onDomChange(applyFontFamily);
    const locale = getCurrentLocale();
    const lang = await getLangAsync(locale);
    if (lang !== null) {
        document.body.style.fontFamily = lang.fontFamily;
    }
    const container = getRootElement<HTMLDivElement>();
    const root = createRoot(container);

    root.render(<RenderApp>{children}</RenderApp>);
}
