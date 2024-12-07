import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { initToolTip } from './tool-tip/init';
import { useHandleFind } from './_find/finderHelpers';
import HandleAlert from './alert/HandleAlert';
import AppReader from './AppReader';
import { useCheckSelectedDir } from './helper/tourHelpers';
import AppContextMenu from './others/AppContextMenu';
import ProgressBar from './progress-bar/ProgressBar';
import Toast from './toast/Toast';
import { MultiContextRender } from './helper/MultiContextRender';
import {
    RouteLocationContext, RouteNavigateContext,
} from './router/routeHelpers';
import { getRootElement, initApp, useQuickExitBlock } from './appInitHelpers';

const location = window.location;
function navigate(routePath: string) {
    location.href = routePath;
}
export function Reader() {
    useQuickExitBlock();
    useCheckSelectedDir();
    useHandleFind();
    return (
        <div id='app' className='dark' data-bs-theme='dark'>
            <MultiContextRender contexts={[
                {
                    context: RouteNavigateContext,
                    value: navigate,
                },
                {
                    context: RouteLocationContext,
                    value: location,
                },
            ]}>
                <AppReader />
                <ProgressBar />
                <Toast />
                <AppContextMenu />
                <HandleAlert />
            </MultiContextRender>
        </div>
    );
}


async function main() {
    await initApp();
    initToolTip();
    const container = getRootElement<HTMLDivElement>();
    const root = createRoot(container);
    root.render(
        <StrictMode>
            <Reader />
        </StrictMode>
    );
}

main();
